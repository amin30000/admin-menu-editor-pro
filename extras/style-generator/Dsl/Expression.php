<?php

namespace YahnisElsts\AdminMenuEditor\StyleGenerator\Dsl;

use YahnisElsts\AdminMenuEditor\Customizable\Settings\AbstractSetting;

abstract class Expression implements SerializableToJsExpression {
	abstract public function getValue();

	public static function boxValues($values) {
		return array_map(
			function ($value) {
				if ( $value instanceof SerializableToJsExpression ) {
					return $value; //Already boxed.
				} else if ( $value instanceof AbstractSetting ) {
					return new SettingReference($value);
				} else if ( is_array($value) && !empty($value) ) {
					return new ArrayValue($value);
				} else {
					return new ConstantValue($value);
				}
			},
			$values
		);
	}

	public static function true() {
		return new ConstantValue(true);
	}
}