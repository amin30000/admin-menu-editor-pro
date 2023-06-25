<?php

namespace YahnisElsts\AdminMenuEditor\StyleGenerator\Dsl;

class FunctionCall extends Expression {
	private $name;
	private $args;
	/**
	 * @var callable
	 */
	private $callback;

	/**
	 * @param string $name
	 * @param array $args
	 * @param callable $callback
	 */
	public function __construct($name, $args, $callback) {
		$this->name = $name;
		$this->args = self::boxValues($args);
		$this->callback = $callback;
	}

	public function getValue() {
		$actualArgs = array_map(
			function (Expression $arg) {
				return $arg->getValue();
			},
			$this->args
		);
		return call_user_func($this->callback, $actualArgs);
	}

	/** @noinspection PhpLanguageLevelInspection */
	#[\ReturnTypeWillChange]
	public function jsonSerialize() {
		return [
			't'    => 'funcCall',
			'name' => $this->name,
			'args' => $this->args,
		];
	}
}