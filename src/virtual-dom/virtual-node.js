class VirtualNode {

  constructor(name, props) {
    this.name = name;
  }

  addChild(childNode) {
    if (!this.children) {
      this.children = [];
    }
    this.children.push(childNode);
  }
}

module.exports = VirtualNode;
