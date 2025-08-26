// Utility to fetch folder structure from GitHub Pages repo
async function fetchTree(path = '') {
  const response = await fetch(path);
  const text = await response.text();

  // Extract file and folder names from HTML directory listing
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  const links = [...doc.querySelectorAll("a")];

  return links
    .map(a => a.getAttribute("href"))
    .filter(h => h && h !== "../")
    .map(h => decodeURIComponent(h));
}

// Build recursive tree view
async function buildTree(container, path = '') {
  const items = await fetchTree(path);
  const ul = document.createElement("ul");

  for (const item of items) {
    const li = document.createElement("li");
    if (item.endsWith("/")) {
      // Folder
      li.textContent = item.replace("/", "");
      li.classList.add("folder", "collapsed");
      li.onclick = async (e) => {
        e.stopPropagation();
        if (li.classList.contains("collapsed")) {
          li.classList.remove("collapsed");
          const subUl = document.createElement("ul");
          await buildTree(subUl, path + item);
          li.appendChild(subUl);
        } else {
          li.classList.add("collapsed");
          li.querySelectorAll("ul").forEach(u => u.remove());
        }
      };
    } else {
      // File
      li.textContent = item;
      li.classList.add("file");
      li.onclick = (e) => {
        e.stopPropagation();
        viewFile(path + item);
      };
    }
    ul.appendChild(li);
  }

  container.appendChild(ul);
}

// Show file content or download link
function viewFile(filePath) {
  const viewer = document.getElementById("file-viewer");
  const ext = filePath.split('.').pop().toLowerCase();

  if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
    viewer.innerHTML = `<img src="${filePath}" style="max-width:100%;">`;
  } else if (ext === "pdf") {
    viewer.innerHTML = `<embed src="${filePath}" type="application/pdf" width="100%" height="600px">`;
  } else {
    viewer.innerHTML = `<a href="${filePath}" download>Download ${filePath}</a>`;
  }
}

// Expand all folders
function expandAll() {
  document.querySelectorAll(".folder.collapsed").forEach(folder => {
    folder.click();
  });
}

// Collapse all folders
function collapseAll() {
  document.querySelectorAll(".folder").forEach(folder => {
    if (!folder.classList.contains("collapsed")) folder.click();
  });
}

// Search
function searchFiles() {
  const term = document.getElementById("searchBox").value.toLowerCase();
  document.querySelectorAll("#file-tree li").forEach(li => {
    if (li.textContent.toLowerCase().includes(term)) {
      li.style.display = "";
    } else {
      li.style.display = "none";
    }
  });
}

// Initialize
window.onload = () => {
  const tree = document.getElementById("file-tree");
  buildTree(tree, "./");
};
