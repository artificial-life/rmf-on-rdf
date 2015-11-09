'use strict'

var Content = require('./Content.js');

class Condition {
  constructor(uri) {
    this.uri = uri;
    this.attribute_map = {};
  }
  isConsumable() {
    return this.content && this.is_consumable;
  }
  getURI() {
    return this.uri;
  }
  setContent(content) {
    this.content = new Content(content);
  }
  getContent() {
    return this.content;
  }

  //@TODO: find way to calc namespace from "attr"
  addAttribute(namespace, attr) {
    this.attribute_map[namespace] = this.attribute_map[namespace] || {};
    var uri = attr.getURI();
    var content = attr.getContent();
    this.attribute_map[namespace][uri] = content;
  }
  resolve(params) {
    //cache resolved state here
    //return ??
  }
  observe(params) {

  }
  reserve(params) {

  }
  intersection(condition) {

  }
}

module.exports = Condition;