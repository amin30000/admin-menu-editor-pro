<?php

namespace YahnisElsts\AdminMenuEditor\ProCustomizable\Settings;

use YahnisElsts\AdminMenuEditor\ProCustomizable\CssPropertyGenerator;
use YahnisElsts\AdminMenuEditor\ProCustomizable\CssValueGenerator;
use YahnisElsts\AdminMenuEditor\StyleGenerator\Dsl\DslFunctions;
use YahnisElsts\AdminMenuEditor\StyleGenerator\Dsl\FunctionCall;
use YahnisElsts\AdminMenuEditor\StyleGenerator\Dsl\JsFunctionCall;
use YahnisElsts\AdminMenuEditor\Customizable\Settings;
use YahnisElsts\AdminMenuEditor\Customizable\Storage\StorageInterface;
use YahnisElsts\AdminMenuEditor\StyleGenerator\Dsl\SettingReference;

class CssLengthSetting extends Settings\FloatSetting implements CssPropertyGenerator, CssValueGenerator {
	protected $cssProperty = '';
	protected $defaultUnit = 'px';
	/**
	 * @var \YahnisElsts\AdminMenuEditor\Customizable\Settings\StringSetting|null
	 */
	protected $unitSetting = null;

	public function __construct(
		$id,
		StorageInterface $store,
		$cssProperty,
		$params = array()
	) {
		parent::__construct($id, $store, $params);
		$this->cssProperty = $cssProperty;
		$this->defaultUnit = isset($params['defaultUnit']) ? $params['defaultUnit'] : $this->defaultUnit;

		if ( isset($params['unitSetting']) ) {
			if ( !($params['unitSetting'] instanceof Settings\Setting) ) {
				throw new \InvalidArgumentException('"unitSetting" must be a Setting');
			}
			$this->unitSetting = $params['unitSetting'];

			if ( !($this->unitSetting->getDataType() === 'string') ) {
				throw new \InvalidArgumentException('"unitSetting" must have a string data type');
			}
		}
	}

	/**
	 * @return string|null
	 */
	public function getCssValue() {
		return DslFunctions::runFormatLength([
			'value' => $this->getValue(),
			'unit'  => $this->getUnit(),
		]);
	}

	public function getUnit() {
		if ( $this->unitSetting === null ) {
			return $this->defaultUnit;
		}
		return $this->unitSetting->getValue($this->defaultUnit);
	}

	public function getCssProperties() {
		$formattedValue = $this->getCssValue();
		if ( empty($formattedValue) ) {
			return array();
		}
		return array($this->cssProperty => $formattedValue,);
	}

	public function getCssValueExpression() {
		$inputs = ['value' => new SettingReference($this)];
		if ( $this->unitSetting ) {
			$inputs['unit'] = $this->unitSetting;
		} else {
			$inputs['unit'] = $this->defaultUnit;
		}
		return new FunctionCall('formatLength', $inputs, [DslFunctions::class, 'runFormatLength']);
	}

	/**
	 * @return \YahnisElsts\AdminMenuEditor\Customizable\Settings\StringSetting|null
	 */
	public function getUnitSetting() {
		return $this->unitSetting;
	}

	public function getJsPreviewConfiguration() {
		return [
			JsFunctionCall::prop($this->cssProperty, $this->getCssValueExpression()),
		];
	}

}