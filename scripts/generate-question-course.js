const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const questionsRoot = path.join(root, "Questions");
const outputPath = path.join(root, "src", "generated", "question-course.ts");
const outputDirectory = path.dirname(outputPath);
const choiceKeyList = [
  "\u0E01",
  "\u0E02",
  "\u0E04",
  "\u0E07",
  "\u0E08",
];
const choiceKeys = choiceKeyList.join("");
const defaultChoiceCount = 4;
const stageTitle = "\u0E14\u0E48\u0E32\u0E19";
const preferredSectionOrder = [
  "Set",
  "Real Number",
  "Function",
  "Trigonometry",
  "Sequence",
  "Counting and Probability",
  "Complex Number",
  "Matrix",
];
const imageExtensions = new Set([".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const textExtensions = new Set([".txt"]);

function exists(filePath) {
  return fs.existsSync(filePath);
}

function readText(filePath) {
  if (!exists(filePath)) {
    return "";
  }

  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "").trim();
}

function readEntries(directoryPath) {
  if (!exists(directoryPath)) {
    return [];
  }

  return fs.readdirSync(directoryPath, { withFileTypes: true });
}

function readDirectories(directoryPath, compare = compareQuestionNames) {
  return readEntries(directoryPath)
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(compare);
}

function readFiles(directoryPath, compare = compareQuestionNames) {
  return readEntries(directoryPath)
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort(compare);
}

function numericPrefix(value) {
  const match = value.match(/^(\d+)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function stripNumericPrefix(value) {
  return value.replace(/^\d+/, "").trim() || value;
}

function normalizeStageName(value) {
  return value.replace(path.extname(value), "");
}

function parseChoiceCount(value) {
  if (value === "4" || value === "\u0E07") {
    return 4;
  }

  if (value === "5" || value === "\u0E08") {
    return 5;
  }

  return undefined;
}

function parseStageName(value) {
  const normalizedValue = normalizeStageName(value);
  const match = normalizedValue.match(
    new RegExp(`^(\\d+)(?:_([${choiceKeys}]+))?(?:_([45\u0E07\u0E08]))?$`),
  );
  const choiceKeyText = match?.[2] ?? "";
  const explicitChoiceCount = match?.[3]
    ? parseChoiceCount(match[3])
    : undefined;

  return {
    choiceCount: explicitChoiceCount ?? defaultChoiceCount,
    correctChoiceKey: choiceKeyText.length === 1 ? choiceKeyText : "",
    number: match ? Number(match[1]) : numericPrefix(normalizedValue),
  };
}

function isSupportedTextFile(fileName) {
  return textExtensions.has(path.extname(fileName).toLowerCase());
}

function isSupportedImageFile(fileName) {
  return imageExtensions.has(path.extname(fileName).toLowerCase());
}

function isSupportedContentFile(fileName) {
  return isSupportedTextFile(fileName) || isSupportedImageFile(fileName);
}

function isStageFile(fileName) {
  return isSupportedTextFile(fileName) && Number.isFinite(parseStageName(fileName).number);
}

function isStageDirectory(directoryPath, directoryName) {
  if (directoryName.toLowerCase() === "learning") {
    return false;
  }

  return Number.isFinite(parseStageName(directoryName).number);
}

function readStageEntries(stagesPath) {
  return readEntries(stagesPath)
    .filter((entry) => {
      if (entry.isDirectory()) {
        return isStageDirectory(stagesPath, entry.name);
      }

      return entry.isFile() && isStageFile(entry.name);
    })
    .sort((left, right) => compareQuestionNames(left.name, right.name));
}

function hasStageEntries(directoryPath) {
  return readStageEntries(directoryPath).length > 0;
}

function findStagesPath(unitPath) {
  const directStagesPath = path.join(unitPath, "Q");

  if (exists(directStagesPath)) {
    return directStagesPath;
  }

  if (hasStageEntries(unitPath)) {
    return unitPath;
  }

  const pendingDirectories = readDirectories(unitPath).map((directory) =>
    path.join(unitPath, directory),
  );

  while (pendingDirectories.length > 0) {
    const currentPath = pendingDirectories.shift();

    if (!currentPath) {
      continue;
    }

    const nestedStagesPath = path.join(currentPath, "Q");

    if (exists(nestedStagesPath)) {
      return nestedStagesPath;
    }

    if (hasStageEntries(currentPath)) {
      return currentPath;
    }

    pendingDirectories.push(
      ...readDirectories(currentPath).map((directory) =>
        path.join(currentPath, directory),
      ),
    );
  }

  return directStagesPath;
}

function hasLearningContent(unitPath) {
  return exists(path.join(unitPath, "learning")) || exists(path.join(unitPath, "learning.txt"));
}

function shouldUseAsUnit(unitPath) {
  return exists(path.join(unitPath, "Q")) || hasStageEntries(unitPath) || hasLearningContent(unitPath);
}

function findNestedUnits(directoryPath) {
  const nestedUnits = [];
  const pendingDirectories = readDirectories(directoryPath).map((directory) =>
    path.join(directoryPath, directory),
  );

  while (pendingDirectories.length > 0) {
    const currentPath = pendingDirectories.shift();

    if (!currentPath) {
      continue;
    }

    if (shouldUseAsUnit(currentPath)) {
      nestedUnits.push(currentPath);
      continue;
    }

    pendingDirectories.push(
      ...readDirectories(currentPath).map((directory) =>
        path.join(currentPath, directory),
      ),
    );
  }

  return nestedUnits;
}

function getUnitPaths(sectionPath) {
  return readDirectories(sectionPath).flatMap((unitFolder) => {
    const unitPath = path.join(sectionPath, unitFolder);

    if (shouldUseAsUnit(unitPath)) {
      return [unitPath];
    }

    return findNestedUnits(unitPath);
  });
}

function parseAnswerChoices(value) {
  const matches = Array.from(
    value.matchAll(new RegExp(`([${choiceKeys}])\\.\\s*`, "g")),
  );

  if (matches.length === 0) {
    return [];
  }

  return matches.map((match, index) => {
    const nextMatch = matches[index + 1];
    const startIndex = (match.index ?? 0) + match[0].length;
    const endIndex = nextMatch?.index ?? value.length;
    const choiceValue = value.slice(startIndex, endIndex).trim();

    return {
      key: match[1],
      label: `${match[1]}. ${choiceValue}`,
      value: choiceValue,
    };
  });
}

function buildChoiceButtons(choiceCount = defaultChoiceCount) {
  return choiceKeyList.slice(0, choiceCount).map((choiceKey) => ({
    key: choiceKey,
    label: choiceKey,
    value: "",
  }));
}

function compareQuestionNames(left, right) {
  const leftNumber = numericPrefix(left);
  const rightNumber = numericPrefix(right);

  if (leftNumber !== rightNumber) {
    return leftNumber - rightNumber;
  }

  return left.localeCompare(right, "th");
}

function compareSectionNames(left, right) {
  const leftPriority = preferredSectionOrder.indexOf(left);
  const rightPriority = preferredSectionOrder.indexOf(right);

  if (leftPriority !== -1 || rightPriority !== -1) {
    if (leftPriority === -1) {
      return 1;
    }

    if (rightPriority === -1) {
      return -1;
    }

    return leftPriority - rightPriority;
  }

  return compareQuestionNames(left, right);
}

function toRequirePath(filePath) {
  const relativePath = path
    .relative(outputDirectory, filePath)
    .replace(/\\/g, "/");

  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

function toAssetPath(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function assetReference(filePath) {
  return {
    __assetReference: toRequirePath(filePath),
  };
}

function contentItemFromFile(filePath) {
  const fileName = path.basename(filePath);

  if (isSupportedImageFile(fileName)) {
    return {
      alt: fileName,
      assetPath: toAssetPath(filePath),
      id: fileName,
      source: assetReference(filePath),
      type: "image",
    };
  }

  if (isSupportedTextFile(fileName)) {
    const text = readText(filePath);

    if (!text) {
      return null;
    }

    return {
      id: fileName,
      text,
      type: "text",
    };
  }

  return null;
}

function contentFromFiles(directoryPath, fileNames) {
  return fileNames
    .filter(isSupportedContentFile)
    .map((fileName) => contentItemFromFile(path.join(directoryPath, fileName)))
    .filter(Boolean);
}

function textFromContent(content) {
  return content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n\n");
}

function getLearningContent(unitPath, stagesPath) {
  const possibleLearningDirectories = [
    path.join(unitPath, "learning"),
    path.join(stagesPath, "learning"),
  ];
  const learningDirectory = possibleLearningDirectories.find(exists);

  if (learningDirectory) {
    return contentFromFiles(learningDirectory, readFiles(learningDirectory));
  }

  const learningTextPath = path.join(unitPath, "learning.txt");
  const learningText = readText(learningTextPath);

  return learningText
    ? [
        {
          id: "learning.txt",
          text: learningText,
          type: "text",
        },
      ]
    : [];
}

function buildFileStage(stagesPath, stageFile, sequentialNumber) {
  const stagePath = path.join(stagesPath, stageFile);
  const stageInfo = parseStageName(stageFile);
  const prompt = readText(stagePath);
  const promptContent = prompt
    ? [
        {
          id: stageFile,
          text: prompt,
          type: "text",
        },
      ]
    : [];

  return {
    answer: "",
    answerChoices: buildChoiceButtons(stageInfo.choiceCount ?? 4),
    correctChoiceKey: stageInfo.correctChoiceKey,
    id: normalizeStageName(stageFile),
    number: sequentialNumber,
    prompt,
    promptContent,
    title: `${stageTitle} ${sequentialNumber}`,
  };
}

function buildDirectoryStage(stagesPath, stageFolder, sequentialNumber) {
  const stagePath = path.join(stagesPath, stageFolder);
  const answer = readText(path.join(stagePath, "A.txt"));
  const stageInfo = parseStageName(stageFolder);
  const promptFiles = readFiles(stagePath).filter(
    (fileName) => fileName.toLowerCase() !== "a.txt",
  );
  const promptContent = contentFromFiles(stagePath, promptFiles);
  const parsedChoices = parseAnswerChoices(answer);
  const countChoices = buildChoiceButtons(stageInfo.choiceCount);

  return {
    answer,
    answerChoices: parsedChoices.length ? parsedChoices : countChoices,
    correctChoiceKey: stageInfo.correctChoiceKey,
    id: stageFolder,
    number: sequentialNumber,
    prompt: textFromContent(promptContent),
    promptContent,
    title: `${stageTitle} ${sequentialNumber}`,
  };
}

function buildStage(stagesPath, stageEntry, sequentialNumber) {
  if (stageEntry.isFile()) {
    return buildFileStage(stagesPath, stageEntry.name, sequentialNumber);
  }

  return buildDirectoryStage(stagesPath, stageEntry.name, sequentialNumber);
}

function serialize(value, depth = 0) {
  const indent = " ".repeat(depth);
  const nextIndent = " ".repeat(depth + 2);

  if (value && typeof value === "object" && value.__assetReference) {
    return `require(${JSON.stringify(value.__assetReference)})`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    return `[\n${value
      .map((item) => `${nextIndent}${serialize(item, depth + 2)}`)
      .join(",\n")}\n${indent}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return "{}";
    }

    return `{\n${entries
      .map(
        ([key, entryValue]) =>
          `${nextIndent}${JSON.stringify(key)}: ${serialize(entryValue, depth + 2)}`,
      )
      .join(",\n")}\n${indent}}`;
  }

  return JSON.stringify(value);
}

function buildCourse() {
  return readDirectories(questionsRoot, compareSectionNames).map((sectionFolder) => {
    const sectionPath = path.join(questionsRoot, sectionFolder);

    return {
      id: sectionFolder,
      title: stripNumericPrefix(sectionFolder),
      units: getUnitPaths(sectionPath).map((unitPath) => {
        const stagesPath = findStagesPath(unitPath);
        const learningContent = getLearningContent(unitPath, stagesPath);
        const stageEntries = readStageEntries(stagesPath);
        const unitFolder = path.basename(unitPath);

        return {
          id: path.relative(sectionPath, unitPath).replace(/\\/g, "/"),
          learning: textFromContent(learningContent),
          learningContent,
          title: stripNumericPrefix(unitFolder),
          stages: stageEntries.map((stageEntry, stageIndex) =>
            buildStage(stagesPath, stageEntry, stageIndex + 1),
          ),
        };
      }),
    };
  });
}

function collectImageSourceMap(courseSections) {
  const imageSources = {};

  for (const section of courseSections) {
    for (const unit of section.units) {
      for (const item of unit.learningContent) {
        if (item.type === "image") {
          imageSources[item.assetPath] = item.source;
        }
      }

      for (const stage of unit.stages) {
        for (const item of stage.promptContent) {
          if (item.type === "image") {
            imageSources[item.assetPath] = item.source;
          }
        }
      }
    }
  }

  return imageSources;
}

const course = buildCourse();
const imageSourceMap = collectImageSourceMap(course);
const output = `// This file is generated by scripts/generate-question-course.js.
// Run npm run generate:questions after editing files under Questions/.

import type { ImageSource } from "expo-image";

export type QuestionCourseContent =
  | {
      id: string;
      text: string;
      type: "text";
    }
  | {
      alt: string;
      assetPath: string;
      id: string;
      source: ImageSource | number;
      type: "image";
    };

export type QuestionCourseStage = {
  answer: string;
  answerChoices: {
    key: string;
    label: string;
    value: string;
  }[];
  correctChoiceKey: string;
  id: string;
  number: number;
  prompt: string;
  promptContent: QuestionCourseContent[];
  title: string;
};

export type QuestionCourseUnit = {
  id: string;
  learning: string;
  learningContent: QuestionCourseContent[];
  stages: QuestionCourseStage[];
  title: string;
};

export type QuestionCourseSection = {
  id: string;
  title: string;
  units: QuestionCourseUnit[];
};

export const QUESTION_IMAGE_SOURCES = ${serialize(imageSourceMap)} satisfies Record<string, ImageSource | number>;

export function getQuestionImageSource(assetPath: string) {
  return QUESTION_IMAGE_SOURCES[assetPath as keyof typeof QUESTION_IMAGE_SOURCES];
}

export const QUESTION_COURSE = ${serialize(course)} satisfies QuestionCourseSection[];
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output, "utf8");

console.log(
  `Generated ${path.relative(root, outputPath)} with ${course.length} section(s).`,
);
