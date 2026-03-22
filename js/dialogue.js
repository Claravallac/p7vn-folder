class DialogueSystem {
  constructor(chapters) {
    this.chapters = chapters;
    this.currentChapter = null;
    this.currentLine = 0;
    this.onLineChange = null;
  }

  loadChapter(chapterId) {
    this.currentChapter = this.chapters[chapterId];
    this.currentLine = 0;
  }

  nextLine() {
    if (!this.currentChapter) return null;
    if (this.currentLine >= this.currentChapter.lines.length) {
      return null;
    }
    const line = this.currentChapter.lines[this.currentLine];
    this.currentLine++;
    return line;
  }

  hasNext() {
    return this.currentChapter && this.currentLine < this.currentChapter.lines.length;
  }
}