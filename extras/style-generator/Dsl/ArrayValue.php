<?php

namespace YahnisElsts\AdminMenuEditor\StyleGenerator\Dsl;

class ArrayValue extends Expression {
	private $items;

	/**
	 * @param array $items
	 */
	public function __construct($items) {
		$this->items = self::boxValues($items);
	}

	public function getValue() {
		return array_map(
			function (Expression $item) {
				return $item->getValue();
			},
			$this->items
		);
	}

	/**
	 * @inheritDoc
	 * @noinspection PhpLanguageLevelInspection
	 */
	#[\ReturnTypeWillChange]
	public function jsonSerialize() {
		return [
			't'     => 'array',
			'items' => $this->items,
		];
	}
}