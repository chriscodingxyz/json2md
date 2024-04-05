import React, { useState } from "react";

type PackageJson = {
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
};

const builtInDependencies: string[] = [
  // Add your list of built-in dependencies here
  "react",
  "react-dom",
  "lodash",
  // Add more if needed
];

function PackageJsonReader() {
  const [packageJsonContent, setPackageJsonContent] = useState<string>("");
  const [dependencies, setDependencies] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [devDependencies, setDevDependencies] = useState<{
    [key: string]: boolean;
  }>({});
  const [showContent, setShowContent] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Function to handle user input
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setPackageJsonContent(value);
    parsePackageJson(value);
    setShowContent(true);
  };

  // Function to handle file drop
  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPackageJsonContent(content);
        parsePackageJson(content);
        setShowContent(true);
      };
      reader.readAsText(file);
    }
  };

  // Function to parse package.json content and extract dependencies
  const parsePackageJson = (content: string) => {
    try {
      const parsedJson: PackageJson = JSON.parse(content);

      const deps = Object.keys(parsedJson.dependencies || {}).reduce(
        (acc, dep) => {
          if (!builtInDependencies.includes(dep)) {
            acc[dep] = true;
          }
          return acc;
        },
        {} as { [key: string]: boolean }
      );

      const devDeps = Object.keys(parsedJson.devDependencies || {}).reduce(
        (acc, dep) => {
          if (!builtInDependencies.includes(dep)) {
            acc[dep] = true;
          }
          return acc;
        },
        {} as { [key: string]: boolean }
      );

      setDependencies(deps);
      setDevDependencies(devDeps);
    } catch (error) {
      // Handle parsing error
      console.error("Error parsing package.json:", error);
    }
  };

  // Function to handle dependency deletion
  const handleDeleteDependency = (
    dependency: string,
    isDevDependency: boolean
  ) => {
    if (isDevDependency) {
      setDevDependencies((prevDevDependencies) => ({
        ...prevDevDependencies,
        [dependency]: false,
      }));
    } else {
      setDependencies((prevDependencies) => ({
        ...prevDependencies,
        [dependency]: false,
      }));
    }
  };

  // Function to generate README.md content
  const generateReadmeContent = () => {
    const dependenciesList = Object.keys(dependencies)
      .filter((dep) => dependencies[dep])
      .map((dep) => `- ${dep}`)
      .join("\n");
    const devDependenciesList = Object.keys(devDependencies)
      .filter((dep) => devDependencies[dep])
      .map((dep) => `- ${dep}`)
      .join("\n");
    return `
# My Awesome Project

## Dependencies
${dependenciesList}

## Development Dependencies
${devDependenciesList}
`;
  };

  // Function to copy Markdown content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateReadmeContent());
  };

  // Function to save Markdown content as file
  const saveToFile = () => {
    const blob = new Blob([generateReadmeContent()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to handle paste from clipboard
  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setPackageJsonContent(text);
      parsePackageJson(text);
      setShowContent(true);
    });
  };

  // Function to handle drag over
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  // Function to handle drag leave
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Function to handle drop zone click
  const handleDropZoneClick = () => {
    document.getElementById("fileInput")?.click();
  };

  return (
    <div className="flex flex-col h-screen">
      <div
        className={`flex-1 ${isDragging ? "bg-gray-200" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
        onClick={handleDropZoneClick}
      >
        <input
          id="fileInput"
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const content = e.target?.result as string;
                setPackageJsonContent(content);
                parsePackageJson(content);
                setShowContent(true);
              };
              reader.readAsText(file);
            }
          }}
        />
        <div className="border-2 border-dashed border-gray-400 p-8">
          <p>Drag and drop a .json file here</p>
        </div>
        <textarea
          className="mt-8 p-4 border-2 border-gray-400"
          placeholder="Paste your package.json content here..."
          value={packageJsonContent}
          onChange={handleInputChange}
          rows={10}
          cols={50}
        />
        <button
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          onClick={handlePaste}
        >
          Paste
        </button>
      </div>
      {showContent && (
        <div className="flex-1 overflow-y-auto bg-green-200">
          <div>
            <h3 className="text-xl font-bold">Dependencies:</h3>
            <ul className="list-disc pl-6">
              {Object.keys(dependencies).map(
                (dep) =>
                  dependencies[dep] && (
                    <li key={dep}>
                      {dep}
                      <button
                        onClick={() => handleDeleteDependency(dep, false)}
                      >
                        Delete
                      </button>
                    </li>
                  )
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold">Development Dependencies:</h3>
            <ul className="list-disc pl-6">
              {Object.keys(devDependencies).map(
                (dep) =>
                  devDependencies[dep] && (
                    <li key={dep}>
                      {dep}
                      <button onClick={() => handleDeleteDependency(dep, true)}>
                        Delete
                      </button>
                    </li>
                  )
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold">Generated README.md content:</h3>
            <pre>{generateReadmeContent()}</pre>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
              onClick={copyToClipboard}
            >
              Copy Markdown
            </button>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded"
              onClick={saveToFile}
            >
              Save as File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackageJsonReader;
