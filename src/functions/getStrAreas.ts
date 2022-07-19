import * as vsc from 'vscode';
import syntax from "../describe-syntax";
import {
	AreaNode,
	ParseContext,
	Quantity,
	Analyzer,
} from "../base";

export default function getStrAreas(text: string): AreaNode|null {
	return syntax({text, i: 0});
}
