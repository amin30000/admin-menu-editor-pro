<?php

namespace YahnisElsts\AdminMenuEditor\KoCustomizableDev;

use YahnisElsts\AdminMenuEditor\Customizable\Controls\AlignmentSelector;
use YahnisElsts\AdminMenuEditor\Customizable\Rendering\FormTableRenderer;
use YahnisElsts\AdminMenuEditor\Customizable\SettingCondition;
use YahnisElsts\AdminMenuEditor\Customizable\Settings\AbstractSetting;
use YahnisElsts\AdminMenuEditor\Customizable\Storage\AbstractSettingsDictionary;
use YahnisElsts\AdminMenuEditor\Customizable\Storage\LazyArrayStorage;
use YahnisElsts\AdminMenuEditor\ProCustomizable\Controls\BorderStyleSelector;
use YahnisElsts\WpDependencyWrapper\ScriptDependency;

class AmeKoCustomizableDevModule extends \ameModule {
	protected $tabSlug = 'customizable-dev';
	protected $tabTitle = 'KO Prototype';

	private $settings;

	public function __construct($menuEditor) {
		parent::__construct($menuEditor);

		$this->settings = new CustomizableTestSettings();
	}

	public function enqueueTabScripts() {
		parent::enqueueTabScripts();

		$structure = $this->getInterfaceStructure();
		$structure->enqueueKoComponentDependencies();

		ScriptDependency::create(plugins_url('ko-customizable-dev.js', __FILE__))
			->addDependencies('jquery', 'ame-customizable-settings', 'ame-lodash', 'ame-knockout')
			->setType('module')
			->addJsVariable('wsAmeKoPrototypeData', [
				'settings'           => AbstractSetting::serializeSettingsForJs($this->settings->getRegisteredSettings()),
				'interfaceStructure' => $structure->serializeForJs(),
			])
			->enqueue();
	}

	protected function outputMainTemplate() {
		$structure = $this->getInterfaceStructure();
		$renderer = new FormTableRenderer();
		$renderer->renderStructure($structure);
		echo '<hr>';

		?>
		<div id="ws-ame-ko-prototype-container">
			<ame-si-structure params="structure: interfaceStructure">
				Knockout will replace contents of this custom element with the interface structure.
			</ame-si-structure>
		</div>
		<?php
		return true;
	}

	private function getInterfaceStructure() {
		$s = $this->settings;
		$b = $s->elementBuilder();
		$enumSetting = $s->getSetting('exampleEnum');

		return $b->structure(
			$b->section(
				'Sample Settings',
				$b->auto('fooInt'),
				$b->auto('barString'),
				$b->auto('bazBool'),
				$b->radioGroup('exampleEnum')
					->choiceChild(
						'one',
						$b->auto('nestedOne')->enabled(
							new SettingCondition($enumSetting, '==', 'one')
						)
					)
					->choiceChild(
						'3.05',
						$b->auto('nestedThree')->enabled(
							new SettingCondition($enumSetting, '==', '3.05')
						)
					)
					->classes('ame-rg-with-color-pickers')
			),
			$b->section(
				'More Settings',
				$b->auto('quxColor'),
				$b->editor('longString'),
				$b->auto('someFont'),
				$b->auto('testImage'),
				$b->control(AlignmentSelector::class, $s->findSetting('alignment'))
			),
			$b->autoSection('exampleSpacing'),
			$b->autoSection('exampleBoxShadow'),
			$b->section(
				'Border styles',
				$b->control(BorderStyleSelector::class, 'exampleBorderStyle')
			)
		)->build();
	}
}

class CustomizableTestSettings extends AbstractSettingsDictionary {
	public function __construct() {
		parent::__construct(
			new LazyArrayStorage(),
			'ame_customizable_test_settings--'
		);

		$this->set(
			'testImage',
			['externalUrl' => 'https://placekitten.com/300/150',]
		);
	}

	protected function createDefaults() {
		return [];
	}

	protected function createSettings() {
		$f = $this->settingFactory();
		return [
			//Create some sample settings.
			$f->integer('fooInt', 'Foo Integer', ['default' => 123]),
			$f->string(
				'barString',
				'Bar String',
				[
					'default'     => 'Hello, world!',
					'description' => 'This is a sample string setting.',
				]),
			$f->boolean('bazBool', 'Baz Boolean', ['description' => 'This is a sample boolean setting.']),
			$f->cssColor('quxColor', 'color', 'Qux Color', ['default' => '#ff0000']),
			$f->cssFont('someFont', 'Font'),
			$f->string('longString', 'Long String', ['default' => str_repeat('Lorem ipsum ', 50)]),
			$f->image('testImage', 'An Image'),
			$f->enum(
				'exampleEnum',
				['one', 2, '3.05'],
				'Enum (mixed types)'
			)
				->describeChoice('one', 'Option 1')
				->describeChoice(2, 'Option 2')
				->describeChoice('3.05', 'Option 3'),
			$f->cssColor('nestedOne', 'Nested One', ['default' => '#00ff00']),
			$f->integer('nestedThree', 'Nested Three', ['default' => 42, 'min' => 10, 'max' => 99]),

			$f->cssSpacing('exampleSpacing', 'Spacing'),
			$f->stringEnum(
				'alignment',
				['none', 'left', 'center', 'right'],
				'Alignment',
				['default' => 'none']
			),
			$f->cssBoxShadow('exampleBoxShadow', 'Box Shadow'),
			$f->cssEnum(
				'exampleBorderStyle',
				'border-style',
				['solid', 'dashed', 'double', 'dotted',],
				'Border style',
				['default' => 'solid']
			),
		];
	}
}