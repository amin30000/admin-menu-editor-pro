<?php

namespace YahnisElsts\AdminMenuEditor\StyleGenerator;

class ConditionalAtRule implements CssStatement {
	/**
	 * @var string
	 */
	protected $identifier;
	/**
	 * @var string
	 */
	protected $conditionString;
	/**
	 * @var CssStatement[]
	 */
	private $nestedStatements;

	public function __construct($identifier, $conditionString, $nestedStatements = []) {
		$this->identifier = $identifier;
		$this->conditionString = $conditionString;
		$this->nestedStatements = $nestedStatements;
	}

	public function getCssText($indentLevel = 0) {
		$indent = str_repeat("\t", $indentLevel);

		$output = "@$this->identifier $this->conditionString {\n";
		foreach ($this->nestedStatements as $statement) {
			$output .= $indent . $statement->getCssText($indentLevel + 1) . "\n";
		}
		$output .= "}\n";
		return $output;
	}

	public function serializeForJs() {
		return [
			't' 		=> 'conditionalAtRule',
			'identifier' => $this->identifier,
			'condition'  => $this->conditionString,
			'nestedStatements' => array_map(
				function (CssStatement $statement) {
					return $statement->serializeForJs();
				},
				$this->nestedStatements
			),
		];
	}
}