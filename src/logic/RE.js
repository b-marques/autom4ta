/**
 * @file Manages Regular Expression operations and Syntax Tree build.
 * @author Bruno Marques do Nascimento
 */

import RegexTree from "regexp-tree";
import FA from "./FA";

export const LEAF_EPSILON = "LEAF_EPSILON";
export const LEAF = "LEAF";
export const OR = "OR";
export const STAR = "STAR";
export const CONCAT = "CONCAT";

const line_regex = /^(\(|\)|\*|\||[a-z]|[0-9])*$/;
let id;
let followpos;
let alphabet;
let id_map;

export default class RE {
    constructor(text = "", valid = false) {
        this.text = text;
        this.valid = valid;
    }

    /**
     * Build DFA from a syntax tree accordingly to the Regular Expression in UI.
     *
     * @return {fa}
     */
    buildDFA() {
        if (this.text === "") {
            this.valid = true;
            return;
        }
        let tree;
        try {
            let text_to_parse = this.text.replace(/[ \t\r\n]+/g, "");
            tree = RegexTree.parse(`/${text_to_parse}/`);
            if (line_regex.test(text_to_parse)) {
                this.valid = true;
            } else {
                throw new Error("Invalid operator");
            }
        } catch (e) {
            this.valid = false;
            console.log(e);
            return;
        }
        let node = new Node();
        node.buildTree(tree.body);

        let dfa = new FA();
        dfa.determinized = true;
        for (let symbol of alphabet) {
            dfa.addSymbol(symbol);
        }

        let initial = [...node.firstpos].sort().join("");
        dfa.addState(initial);
        dfa.initial = initial;

        let has_changed;

        do {
            has_changed = false;
            for (let state of dfa.states) {
                for (let symbol of dfa.alphabet) {
                    let is_final = false;
                    let to = new Set();
                    for (let position of state.split("")) {
                        if (id_map[position] === symbol) {
                            for (let each of followpos[position]) {
                                to.add(each);
                            }
                        }
                    }
                    if (to.size) {
                        let new_state = [...to].sort().join("");
                        dfa.transitions[state][symbol].to = new Set(new_state);
                        dfa.transitions[state][symbol].text = " " + new_state;
                        if (to.has(0)) is_final = true;
                        if (!dfa.states.has(new_state)) {
                            dfa.addState(new_state);
                            if (is_final) dfa.addFinal(new_state);
                            has_changed = true;
                        }
                    }
                }
            }
        } while (has_changed);

        dfa.renameStates();
        return dfa;
    }
}

class Node {
    constructor(id, nullable, c1, c2, type, value, firstpos, lastpos) {
        this.id = id;
        this.nullable = nullable;
        this.type = type;
        this.value = value;
        this.c1 = c1;
        this.c2 = c2;
        this.firstpos = firstpos;
        this.lastpos = lastpos;
    }

    /**
     * Function called by root node to build syntax tree.
     */
    buildTree(tree) {
        alphabet = new Set();
        id_map = [];
        // Prepare initial node
        id = 0;
        followpos = [];
        this.type = CONCAT;
        this.c1 = new Node();
        this.c2 = new Node();
        this.c2.buildNodes({ type: "Char", value: "#" });
        this.c1.buildNodes(tree);
        this.nullable = this.c1.nullable && this.c2.nullable;

        // Set firstpos
        this.firstpos = new Set(this.c1.firstpos);
        if (this.c1.nullable) {
            for (let each of this.c2.firstpos) {
                this.firstpos.add(each);
            }
        }
        // Set lastpos
        this.lastpos = new Set(this.c2.lastpos);
        if (this.c2.nullable) {
            for (let each of this.c1.lastpos) {
                this.lastpos.add(each);
            }
        }
        // Set followpos
        for (let i of this.c1.lastpos) {
            for (let each of this.c2.firstpos) {
                followpos[i].add(each);
            }
        }

        alphabet.delete("#");
    }

    /**
     * Recursive function responsible to build the syntax tree.
     *
     * @param {object} tree The tree node to be processed
     */
    buildNodes(tree) {
        if (tree === null) {
            this.type = LEAF_EPSILON;
            this.nullable = true;
            this.firstpos = new Set();
            this.lastpos = new Set();
            return;
        }
        switch (tree.type) {
            case "Alternative":
                let last_element = tree.expressions[tree.expressions.length - 1];
                if (tree.expressions.length > 2) {
                    this.type = CONCAT;
                    this.c1 = new Node();
                    this.c2 = new Node();
                    this.c2.buildNodes(last_element);
                    tree.expressions.splice(-1, 1);
                    this.c1.buildNodes(tree);
                } else {
                    this.type = CONCAT;
                    this.c1 = new Node();
                    this.c2 = new Node();
                    this.c2.buildNodes(last_element);
                    this.c1.buildNodes(tree.expressions[0]);
                }
                this.nullable = this.c1.nullable && this.c2.nullable;

                // Set firstpos
                this.firstpos = new Set(this.c1.firstpos);
                if (this.c1.nullable) {
                    for (let each of this.c2.firstpos) {
                        this.firstpos.add(each);
                    }
                }

                // Set lastpos
                this.lastpos = new Set(this.c2.lastpos);
                if (this.c2.nullable) {
                    for (let each of this.c1.lastpos) {
                        this.lastpos.add(each);
                    }
                }

                // Set followpos
                for (let i of this.c1.lastpos) {
                    for (let each of this.c2.firstpos) {
                        followpos[i].add(each);
                    }
                }

                break;

            case "Disjunction":
                this.type = OR;
                this.c1 = new Node();
                this.c2 = new Node();
                this.c2.buildNodes(tree.right);
                this.c1.buildNodes(tree.left);
                this.nullable = this.c1.nullable || this.c2.nullable;
                this.firstpos = new Set(this.c1.firstpos);
                for (let each of this.c2.firstpos) {
                    this.firstpos.add(each);
                }
                this.lastpos = new Set(this.c1.lastpos);
                for (let each of this.c2.lastpos) {
                    this.lastpos.add(each);
                }
                break;

            case "Repetition":
                this.type = STAR;
                this.c1 = new Node();
                this.c2 = null;
                this.c1.buildNodes(tree.expression);

                this.nullable = true;
                this.firstpos = new Set(this.c1.firstpos);
                this.lastpos = new Set(this.c1.lastpos);

                // Set followpos
                for (let i of this.lastpos) {
                    for (let each of this.firstpos) {
                        followpos[i].add(each);
                    }
                }
                break;

            case "Group":
                this.buildNodes(tree.expression);
                break;

            case "Char":
                alphabet.add(tree.value);
                id_map[id] = tree.value;

                this.type = LEAF;
                this.c1 = null;
                this.c2 = null;
                this.value = tree.value;
                this.nullable = false;
                this.firstpos = new Set([id]);
                this.lastpos = new Set([id]);
                followpos[id] = new Set();
                this.id = id++;

                break;

            default:
                break;
        }
    }
}
