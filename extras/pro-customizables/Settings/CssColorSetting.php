<?php

namespace YahnisElsts\AdminMenuEditor\ProCustomizable\Settings;

use YahnisElsts\AdminMenuEditor\ProCustomizable\CssPropertyGenerator;
use YahnisElsts\AdminMenuEditor\StyleGenerator\Dsl\JsFunctionCall;
use YahnisElsts\AdminMenuEditor\Customizable\Settings;
use YahnisElsts\AdminMenuEditor\Customizable\Storage\StorageInterface;

class CssColorSetting extends Settings\ColorSetting implements CssPropertyGenerator {
	/**
	 * @var string|null
	 */
	protected $cssProperty = '';

	public function __construct($id, StorageInterface $store, $cssProperty, $params = array()) {
		parent::__construct($id, $store, $params);
		$this->cssProperty = $cssProperty;
	}

	public function getCssProperties() {
		$value = $this->getValue();
		if ( ($value === null) || ($value === '') || empty($this->cssProperty) ) {
			return array();
		}
		return array($this->cssProperty => $value,);
	}

	public function validate($errors, $value, $stopOnFirstError = false) {
		//Allow the "transparent" keyword for CSS colors.
		if ( $value === 'transparent' ) {
			return $value;
		}
		return parent::validate($errors, $value);
	}

	/**
	 * Convert a color in the #RRGGBB or #RGB format to the rgba() format.
	 *
	 * @param string $color
	 * @param float $opacity
	 * @return string
	 */
	public static function convertToRgba($color, $opacity = 1.0) {
		$color = trim($color);
		if ( $color === '' ) {
			return 'rgba(0, 0, 0, ' . $opacity . ')';
		}

		//Strip the leading hash, if any.
		if ( $color[0] === '#' ) {
			$color = substr($color, 1);
		}

		//Convert 3-digit hex to 6-digit hex.
		if ( strlen($color) === 3 ) {
			$color = $color[0] . $color[0] . $color[1] . $color[1] . $color[2] . $color[2];
		}

		//Convert hex to RGB.
		$red = hexdec(substr($color, 0, 2));
		$green = hexdec(substr($color, 2, 2));
		$blue = hexdec(substr($color, 4, 2));

		return 'rgba(' . $red . ', ' . $green . ', ' . $blue . ', ' . $opacity . ')';
	}

	public function getJsPreviewConfiguration() {
		return [JsFunctionCall::prop($this->cssProperty, $this)];
	}
}