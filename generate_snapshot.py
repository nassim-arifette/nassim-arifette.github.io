#!/usr/bin/env python3
"""
Utility script to snapshot the project’s structure and source files.

Running this script writes `project_snapshot.txt` in the repository root with:
  1. A formatted tree of the project (skipping bulky build artifacts).
  2. The contents of each relevant source file, separated by headers.

Binary assets such as PDFs, images, and fonts are kept in the tree view but
omitted from the file content dump to keep the output readable.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Iterable, List

ROOT = Path(__file__).resolve().parent
OUTPUT_FILE = ROOT / "project_snapshot.txt"

# Directories that should appear in the tree but not be traversed for contents.
EXCLUDED_DIRS = {
    ".git",
    ".next",
    ".contentlayer",
    "node_modules",
    "dist",
    "build",
    "coverage",
    "__pycache__",
}

# File extensions whose contents should be omitted from the dump.
SKIP_CONTENT_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".icns",
    ".svg",
    ".ttf",
    ".otf",
    ".woff",
    ".woff2",
    ".mp3",
    ".mp4",
    ".mov",
    ".zip",
    ".gz",
    ".tar",
}

# Additional file names to omit from content sections (tree still shows them).
SKIP_CONTENT_NAMES = {
    OUTPUT_FILE.name,
}


def build_tree_lines(path: Path, prefix: str = "") -> List[str]:
    """Return a list of strings representing a tree structure rooted at path."""
    entries = sorted(
        path.iterdir(),
        key=lambda p: (p.is_file(), p.name.lower()),
    )
    lines: List[str] = []

    for index, entry in enumerate(entries):
        connector = "└── " if index == len(entries) - 1 else "├── "
        line = f"{prefix}{connector}{entry.name}"

        if entry.is_dir():
            if entry.name in EXCLUDED_DIRS:
                lines.append(f"{line} [skipped]")
                continue

            lines.append(line)
            extension_prefix = "    " if index == len(entries) - 1 else "│   "
            lines.extend(build_tree_lines(entry, prefix + extension_prefix))
        else:
            lines.append(line)

    return lines


def iter_files(root: Path) -> Iterable[Path]:
    """Yield file paths whose contents should be added to the snapshot."""
    stack = [root]

    while stack:
        current = stack.pop()
        for entry in sorted(current.iterdir(), key=lambda p: p.name.lower()):
            if entry.is_dir():
                if entry.name in EXCLUDED_DIRS:
                    continue
                stack.append(entry)
            elif should_include_file(entry):
                yield entry


def should_include_file(path: Path) -> bool:
    """Return True when the file’s content should be written to the snapshot."""
    if path.name in SKIP_CONTENT_NAMES:
        return False

    if path.suffix.lower() in SKIP_CONTENT_EXTENSIONS:
        return False

    return True


def read_file(path: Path) -> str:
    """Read a text file with UTF-8 fallback handling."""
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        # Fall back to replacing undecodable characters so we keep the content.
        return path.read_text(encoding="utf-8", errors="replace")


def write_snapshot(root: Path, output_path: Path) -> None:
    """Generate the snapshot file."""
    tree_header = ["Project structure:", ""]
    tree_lines = build_tree_lines(root)

    sections = tree_header + tree_lines + ["", ""]

    for file_path in iter_files(root):
        rel_path = file_path.relative_to(root)
        sections.append(f"======= {rel_path} =======")
        sections.append(read_file(file_path).rstrip())
        sections.append("")  # Blank line between files

    output_path.write_text("\n".join(sections), encoding="utf-8")


def parse_args(argv: Iterable[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate project_snapshot.txt with tree and file contents."
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=ROOT,
        help="Root directory to snapshot (defaults to script location).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=OUTPUT_FILE,
        help="Output file path (defaults to project_snapshot.txt in root).",
    )
    return parser.parse_args(list(argv))


def main(argv: Iterable[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    root = args.root.resolve()
    output_path = args.output.resolve()

    if not root.is_dir():
        print(f"Root directory does not exist: {root}", file=sys.stderr)
        return 1

    write_snapshot(root, output_path)
    print(f"Snapshot written to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
