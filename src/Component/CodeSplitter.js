import React, { useState, useEffect, useCallback, useRef } from "react";
import JSZip from "jszip";
import "./CodeSplitter.css";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faUpDownLeftRight,
  faUpload,
  faCheck,
  faTimes,
  faArrowUp,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";

const CodeSplitter = () => {
  const [text, setText] = useState("");
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunks, setChunks] = useState([]);
  const [copyStatus, setCopyStatus] = useState("");
  const [splitByWords, setSplitByWords] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedChunks, setHighlightedChunks] = useState([0]);
  const [view, setView] = useState("list");
  const [showContent, setShowContent] = useState(false);
  const [selectedOption, setSelectedOption] = useState("option1");
  const [isConfigVisible, setIsConfigVisible] = useState(false);
  const configRef = useRef(null);
  const boxRefs = useRef([]);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (boxRefs.current[currentChunkIndex]) {
      boxRefs.current[currentChunkIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentChunkIndex]);
  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleToggleConfig = () => {
    setIsConfigVisible(!isConfigVisible);
  };

  const handleClickOutside = (event) => {
    if (configRef.current && !configRef.current.contains(event.target)) {
      setIsConfigVisible(false);
    }
  };

  useEffect(() => {
    if (isConfigVisible) {
      window.addEventListener("scroll", handleHideOnScroll);
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleHideOnScroll);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleHideOnScroll);
    };
  }, [isConfigVisible]);

  const handleHideOnScroll = () => {
    setIsConfigVisible(false);
  };

  const splitText = (text, size) => {
    const result = [];

    for (let i = 0; i < text.length; i += size) {
      result.push(text.slice(i, i + size));
    }

    return result.filter(Boolean);
  };

  const splitTextWord = (text, size) => {
    const result = [];
    const words = text.split(" ");
    for (let i = 0; i < words.length; i += size) {
      result.push(words.slice(i, i + size).join(" "));
    }
    return result.filter(Boolean);
  };

  const splitTextDelimiter = (text, delimiter) => {
    const result = [];
    if (delimiter) {
      result.push(...text.split(delimiter));
    }
    return result.filter(Boolean);
  };

  const handleSplit = () => {
    if (chunkSize <= 0) {
      alert("Chunk size must be greater than zero.");
      return;
    }
    const newChunks = splitText(text, chunkSize);
    setChunks(newChunks);
    setCurrentChunkIndex(0); // Reset to the first chunk
    setShowContent(true);
  };

  const handleSplitWord = () => {
    if (chunkSize <= 0) {
      alert("Chunk size must be greater than zero.");
      return;
    }
    const newChunks = splitTextWord(text, chunkSize);
    setChunks(newChunks);
    setCurrentChunkIndex(0); // Reset to the first chunk
    setShowContent(true);
  };

  const handleSplitDelimiter = () => {
    if (chunkSize <= 0) {
      alert("Chunk size must be greater than zero.");
      return;
    }
    const newChunks = splitTextDelimiter(text, chunkSize, customDelimiter);
    setChunks(newChunks);
    setCurrentChunkIndex(0); // Reset to the first chunk
    setShowContent(true);
  };

  const handleCopy = (chunk, index, totalChunks) => {
    const partNumber = index + 1;
    let prefix = "";
    let suffix = "";

    if (partNumber === totalChunks) {
      prefix = `[START PART ${partNumber}/${totalChunks}]\n`;
      suffix = `\n[END PART ${partNumber}/${totalChunks}]\nALL PARTS SENT. Now you can continue processing the request.`;
    } else if (partNumber === 1) {
      prefix = `Do not answer yet. This is the first part of the text I want to send you. Just receive and acknowledge as "Part ${partNumber}/${totalChunks} received" and wait for the next part.\n[START PART ${partNumber}/${totalChunks}]\n`;
      suffix = `\n[END PART ${partNumber}/${totalChunks}]\nRemember not answering yet. Just acknowledge you received this part with the message "Part ${partNumber}/${totalChunks} received" and wait for the next part.`;
    } else {
      prefix = `Do not answer yet. This is just another part of the text I want to send you. Just receive and acknowledge as "Part ${partNumber}/${totalChunks} received" and wait for the next part.\n[START PART ${partNumber}/${totalChunks}]\n`;
      suffix = `\n[END PART ${partNumber}/${totalChunks}]\nRemember not answering yet. Just acknowledge you received this part with the message "Part ${partNumber}/${totalChunks} received" and wait for the next part.`;
    }

    const textToCopy = prefix + chunk + suffix;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        handleButtonClick(index);
      })
      .catch((err) => {
        console.error("Error copying text: ", err);
      });
  };

  const handleCopyChunk = (chunk, index, totalChunks) => {
    const partNumber = index + 1;
    let prefix = "";
    let suffix = "";

    if (partNumber === totalChunks) {
      prefix = `[START PART ${partNumber}/${totalChunks}]\n`;
      suffix = `\n[END PART ${partNumber}/${totalChunks}]\nALL PARTS SENT. Now you can continue processing the request.`;
    } else if (partNumber === 1) {
      prefix = `Do not answer yet. This is the first part of the text I want to send you. Just receive and acknowledge as "Part ${partNumber}/${totalChunks} received" and wait for the next part.\n[START PART ${partNumber}/${totalChunks}]\n`;
      suffix = `\n[END PART ${partNumber}/${totalChunks}]\nRemember not answering yet. Just acknowledge you received this part with the message "Part ${partNumber}/${totalChunks} received" and wait for the next part.`;
    } else {
      prefix = `Do not answer yet. This is just another part of the text I want to send you. Just receive and acknowledge as "Part ${partNumber}/${totalChunks} received" and wait for the next part.\n[START PART ${partNumber}/${totalChunks}]\n`;
      suffix = `\n[END PART ${partNumber}/${totalChunks}]\nRemember not answering yet. Just acknowledge you received this part with the message "Part ${partNumber}/${totalChunks} received" and wait for the next part.`;
    }

    const textToCopy = prefix + chunk + suffix;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopyStatus(`Part ${partNumber}/${totalChunks} copied to clipboard`);
        setTimeout(() => setCopyStatus(""), 2000);
      })
      .catch((err) => {
        console.error("Error copying text: ", err);
      });
  };

  const handleCopyInstruction = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        handleButtonClick(99999);
      })
      .catch((err) => {
        console.error("Error copying text: ", err);
      });
  };

  const handleBatchCopy = () => {
    const allChunksText = chunks
      .map((chunk, index) => {
        const partNumber = index + 1;
        let prefix = "";
        let suffix = "";

        if (partNumber === chunks.length) {
          prefix = `[START PART ${partNumber}/${chunks.length}]\n`;
          suffix = `\n[END PART ${partNumber}/${chunks.length}]\nALL PARTS SENT. Now you can continue processing the request.`;
        } else if (partNumber === 1) {
          prefix = `Do not answer yet. This is the first part of the text I want to send you. Just receive and acknowledge as "Part ${partNumber}/${chunks.length} received" and wait for the next part.\n[START PART ${partNumber}/${chunks.length}]\n`;
          suffix = `\n[END PART ${partNumber}/${chunks.length}]\nRemember not answering yet. Just acknowledge you received this part with the message "Part ${partNumber}/${chunks.length} received" and wait for the next part.`;
        } else {
          prefix = `Do not answer yet. This is just another part of the text I want to send you. Just receive and acknowledge as "Part ${partNumber}/${chunks.length} received" and wait for the next part.\n[START PART ${partNumber}/${chunks.length}]\n`;
          suffix = `\n[END PART ${partNumber}/${chunks.length}]\nRemember not answering yet. Just acknowledge you received this part with the message "Part ${partNumber}/${chunks.length} received" and wait for the next part.`;
        }

        return prefix + chunk + suffix;
      })
      .join("\n\n");

    navigator.clipboard
      .writeText(allChunksText)
      .then(() => {
        setCopyStatus("All chunks copied to clipboard");
        setTimeout(() => setCopyStatus(""), 2000);
      })
      .catch((err) => {
        console.error("Error copying text: ", err);
      });
  };

  const handleBatchDownload = () => {
    const zip = new JSZip();
    chunks.forEach((chunk, index) => {
      const partNumber = index + 1;
      let prefix = "";
      let suffix = "";

      if (partNumber === chunks.length) {
        prefix = `[START PART ${partNumber}/${chunks.length}]\n`;
        suffix = `\n[END PART ${partNumber}/${chunks.length}]\nALL PARTS SENT. Now you can continue processing the request.`;
      } else if (partNumber === 1) {
        prefix = `Do not answer yet. This is the first part of the text I want to send you. Just receive and acknowledge as "Part ${partNumber}/${chunks.length} received" and wait for the next part.\n[START PART ${partNumber}/${chunks.length}]\n`;
        suffix = `\n[END PART ${partNumber}/${chunks.length}]\nRemember not answering yet. Just acknowledge you received this part with the message "Part ${partNumber}/${chunks.length} received" and wait for the next part.`;
      } else {
        prefix = `Do not answer yet. This is just another part of the text I want to send you. Just receive and acknowledge as "Part ${partNumber}/${chunks.length} received" and wait for the next part.\n[START PART ${partNumber}/${chunks.length}]\n`;
        suffix = `\n[END PART ${partNumber}/${chunks.length}]\nRemember not answering yet. Just acknowledge you received this part with the message "Part ${partNumber}/${chunks.length} received" and wait for the next part.`;
      }

      const textToSave = prefix + chunk + suffix;
      zip.file(`chunk_${partNumber}.txt`, textToSave);
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      const element = document.createElement("a");
      element.href = URL.createObjectURL(content);
      element.download = "chunks.zip";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target.result);
      };
      reader.readAsText(uploadedFile);
    }
  }, []);

  const handleClear = () => {
    setText("");
    setChunks([]);
    setCopyStatus("");
  };

  const handleDownload = (chunk, index) => {
    const element = document.createElement("a");
    const file = new Blob([chunk], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `chunk_${index + 1}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  const handleDownloadInstruction = (text) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Instruction.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleHighlight = (index, chunk, totalChunks) => {
    setCurrentChunkIndex(index);
    setHighlightedChunks([index]);
  };

  const handleSearch = () => {
    if (searchTerm) {
      const highlighted = chunks
        .map((chunk, index) => (chunk.includes(searchTerm) ? index : -1))
        .filter((index) => index !== -1);
      setHighlightedChunks(highlighted);
    } else {
      setHighlightedChunks([]);
    }
  };

  //   const handleSortChunks = (type) => {
  //     let sortedChunks = [...chunks];
  //     if (type === "length") {
  //       sortedChunks.sort((a, b) => a.length - b.length);
  //     } else if (type === "alphabetical") {
  //       sortedChunks.sort();
  //     }
  //     setChunks(sortedChunks);
  //   };

  const handleSaveConfig = () => {
    const config = {
      chunkSize,
      customDelimiter,
      splitByWords,
    };
    localStorage.setItem("codeSplitterConfig", JSON.stringify(config));
    handleToggleConfig();
  };

  const handleLoadConfig = () => {
    const config = JSON.parse(localStorage.getItem("codeSplitterConfig"));
    if (config) {
      setChunkSize(config.chunkSize);
      setCustomDelimiter(config.customDelimiter);
      setSplitByWords(config.splitByWords);
    }
    handleToggleConfig();
  };

  const handleResetConfig = () => {
    setText("");
    setChunkSize(1000);
    setCustomDelimiter("");
    setSplitByWords(false);
    setShowContent(false);
    handleToggleConfig();
  };

  const toggleView = () => {
    setView(view === "list" ? "grid" : "list");
  };

  const content = `
  The total length of the content that I want to send you is too large to send in only one piece.
        
  For sending you that content, I will follow this rule:
          
  [START PART ${chunks.length + 1 - chunks.length}/${chunks.length}] 
  this is the content of the part ${chunks.length + 1 - chunks.length} out of ${
    chunks.length
  } in total
  [END PART ${chunks.length + 1 - chunks.length}/${chunks.length}]
          
  Then you just answer: "Received part ${chunks.length + 1 - chunks.length}/${
    chunks.length
  }"
          
  And when I tell you "ALL PARTS SENT", then you can continue processing the data and answering my requests.
  `;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const initialButtonState = Array(chunks.length).fill(false);

  const [copiedState, setCopiedState] = useState(initialButtonState);

  const handleButtonClick = (index) => {
    const newCopiedState = [...copiedState];
    newCopiedState[index] = true;
    setCopiedState(newCopiedState);
  };

  return (
    <div className="container">
      <header ref={configRef}>
        <h1>Code Splitter</h1>{" "}
        <div className="faCog-container">
          <FontAwesomeIcon
            icon={faCog}
            className="faCog"
            onClick={handleToggleConfig}
          />
          {isConfigVisible && (
            <div className="Configuration" onClick={(e) => e.stopPropagation()}>
              <button onClick={handleSaveConfig}>Save Configuration</button>
              <button onClick={handleLoadConfig}>Load Configuration</button>
              <button onClick={handleResetConfig}>Reset Configuration</button>
            </div>
          )}
        </div>
      </header>

      <textarea
        placeholder="Enter text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="15"
        cols="50"
      ></textarea>
      <div className="FileSelect">
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? "active" : ""}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>
              <FontAwesomeIcon
                icon={faFileUpload}
                style={{ marginRight: "5px" }}
              />
              Drop The Files Here
            </p>
          ) : (
            <p>
              {" "}
              <FontAwesomeIcon icon={faUpDownLeftRight}></FontAwesomeIcon> Drag
              'n' Drop Some Files Here, Or Click To{" "}
              <FontAwesomeIcon icon={faUpload} /> Select Files
            </p>
          )}
        </div>
      </div>
      <div className="ChunkSizeCustomDelimiter">
        <div
          className="custom-radio"
          onClick={() => handleOptionChange("option1")}
        >
          <input
            type="radio"
            id="option1"
            name="customRadio"
            value="option1"
            checked={selectedOption === "option1"}
            readOnly
          />
          <label htmlFor="option1">
            {selectedOption === "option1" ? (
              <FontAwesomeIcon icon={faCheck} />
            ) : (
              <FontAwesomeIcon icon={faTimes} />
            )}
          </label>
          <input
            type="number"
            value={chunkSize}
            onChange={(e) => setChunkSize(parseInt(e.target.value))}
            placeholder="Chunk size"
            className="ChunkSize"
          />
        </div>

        <div
          className="custom-radio"
          onClick={() => handleOptionChange("option2")}
        >
          <input
            type="radio"
            id="option2"
            name="customRadio"
            value="option2"
            checked={selectedOption === "option2"}
            readOnly
          />
          <label htmlFor="option2">
            {selectedOption === "option2" ? (
              <FontAwesomeIcon icon={faCheck} />
            ) : (
              <FontAwesomeIcon icon={faTimes} />
            )}
          </label>
          <input
            type="text"
            value={customDelimiter}
            onChange={(e) => setCustomDelimiter(e.target.value)}
            placeholder="Custom delimiter"
            className="CustomDelimiter"
          />
        </div>
      </div>
      <div className="split-text-buttons-outer">
        <div className="split-text-buttons">
          {selectedOption === "option1" ? (
            <>
              <button onClick={handleSplit} disabled={text === ""}>
                Split Text Character
              </button>
              <button onClick={handleSplitWord} disabled={text === ""}>
                Split Text Word
              </button>
            </>
          ) : (
            <button onClick={handleSplitDelimiter} disabled={text === ""}>
              Split Text Delimiter
            </button>
          )}

          <button onClick={handleClear}>Clear</button>
        </div>
      </div>
      {/* <div>
        <button onClick={() => handleSortChunks("length")}>
          Sort by Length
        </button>
        <button onClick={() => handleSortChunks("alphabetical")}>
          Sort Alphabetically
        </button>
      </div> */}
      {showContent ? (
        <div>
          <div className="searchContainer">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search term"
            />
            <button onClick={handleSearch} className="searchButton">
              Search
            </button>
          </div>
          <div className="ToggleCopyDownload">
            <button onClick={toggleView}>Toggle View</button>
            <div>
              <button onClick={handleBatchCopy}>Copy All Chunks</button>
              <button onClick={handleBatchDownload}>Download All Chunks</button>
            </div>
          </div>
          {view === "list" ? (
            <div className="list-view">
              <div className="chunk">
                <p
                  style={{
                    whiteSpace: "pre-line",
                    wordWrap: "break-word",
                    margin: "0px",
                  }}
                >
                  <div style={{ height: "265px", overflowY: "auto" }}>
                    {content}
                  </div>
                </p>
                <div className="bottom">
                  <p className="allInOne">Chunk Size : {content.length}</p>
                  <div>
                    <button
                      className={copiedState[99999] ? "copied" : ""}
                      onClick={() => handleCopyInstruction(content)}
                    >
                      {copiedState[99999] ? "Instruction copied" : "Copy"}
                    </button>

                    <button onClick={() => handleDownloadInstruction(content)}>
                      Download
                    </button>
                  </div>
                </div>
              </div>
              {chunks.map((chunk, index) => (
                <div
                  key={index}
                  className={`chunk ${
                    highlightedChunks.includes(index) ? "highlighted" : ""
                  }`}
                  onClick={() => {
                    handleHighlight(index, chunk, chunks.length);
                  }}
                  ref={(el) => (boxRefs.current[index] = el)}
                >
                  <p>{chunk}</p>
                  <div className="bottom">
                    <div className="flex">
                      <p className="allInOne">Chunk No. : {index + 1}</p>
                      <p className="allInOne">Chunk Size : {chunk.length}</p>
                    </div>
                    <div>
                      <button
                        className={copiedState[index] ? "copied" : ""}
                        onClick={() => handleCopy(chunk, index, chunks.length)}
                      >
                        {copiedState[index] ? "Copied" : "Copy"}
                      </button>
                      <button onClick={() => handleDownload(chunk, index)}>
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-view">
              <div className="chunk">
                <p
                  style={{
                    whiteSpace: "pre-line",
                    wordWrap: "break-word",
                    margin: "0px",
                  }}
                >
                  {" "}
                  <div style={{ height: "248px", overflowY: "auto" }}>
                    {content}
                  </div>
                  <div className="bottom">
                    <button
                      className={copiedState[99999] ? "copied" : ""}
                      onClick={() => handleCopyInstruction(content)}
                    >
                      {copiedState[99999] ? "Instruction copied" : "Copy"}
                    </button>
                    <button onClick={() => handleDownloadInstruction(content)}>
                      Download
                    </button>
                  </div>
                </p>
              </div>
              {chunks.map((chunk, index) => (
                <div
                  key={index}
                  className={`chunk ${
                    highlightedChunks.includes(index) ? "highlighted" : ""
                  }`}
                  onClick={() => handleHighlight(chunk, index, chunks.length)}
                  ref={(el) => (boxRefs.current[index] = el)}
                >
                  <div style={{ height: "248px", overflowY: "auto" }}>
                    <p>{chunk}</p>
                  </div>

                  <div className="bottom">
                    <div className="flex">
                      <p className="allInOne">Chunk No. : {index + 1}</p>
                      <p className="allInOne">Chunk Size : {chunk.length}</p>
                    </div>
                    <div>
                      <button
                        className={copiedState[index] ? "copied" : ""}
                        onClick={() => handleCopy(chunk, index, chunks.length)}
                      >
                        {copiedState[index] ? "Copied" : "Copy"}
                      </button>{" "}
                      <button onClick={() => handleDownload(chunk, index)}>
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="footer-buttons-container">
            <div className="footer-buttons">
              <button
                onClick={() => {
                  setCurrentChunkIndex(currentChunkIndex - 1);
                  setHighlightedChunks([currentChunkIndex - 1]);
                }}
                disabled={currentChunkIndex === 0}
              >
                Previous Chunk
              </button>
              <button
                onClick={() => {
                  setCurrentChunkIndex(currentChunkIndex + 1);
                  setHighlightedChunks([currentChunkIndex + 1]);
                }}
                disabled={currentChunkIndex === chunks.length - 1}
              >
                Next Chunk
              </button>

              {/* <button onClick={() => handleCopyChunk()}>
                Copy Chunk {currentChunkIndex + 1}{" "}
              </button> */}
              <button
                onClick={() =>
                  handleCopyChunk(
                    chunks[currentChunkIndex],
                    currentChunkIndex,
                    chunks.length
                  )
                }
              >
                Copy Chunk {currentChunkIndex + 1}
              </button>
            </div>
          </div>
          {/* {copyStatus && <p className="copy-status">{copyStatus}</p>}{" "} */}
          {showButton && (
            <button className="scroll-to-top" onClick={scrollToTop}>
              <FontAwesomeIcon icon={faArrowUp} />
            </button>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default CodeSplitter;
