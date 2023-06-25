<?php

use YahnisElsts\AdminMenuEditor\Customizable\Storage\AbstractSettingsDictionary;
use YahnisElsts\AdminMenuEditor\Customizable\Storage\ModuleSettings;
use YahnisElsts\AdminMenuEditor\Customizable\Storage\ScopedOptionStorage;

class amePersistentProModule extends amePersistentModule implements ameExportableModule {
	/**
	 * @var ModuleSettings|array|null
	 */
	protected $settings = null;

	protected $settingsWrapperEnabled = false;

	protected $lastModifiedSettingEnabled = false;

	public function loadSettings() {
		if ( isset($this->settings) ) {
			return $this->settings;
		}
		if ( !$this->settingsWrapperEnabled ) {
			return parent::loadSettings();
		}

		$scope = ($this->menuEditor->get_plugin_option('menu_config_scope') === 'site')
			? ScopedOptionStorage::SITE_SCOPE
			: ScopedOptionStorage::GLOBAL_SCOPE;

		$this->settings = new ModuleSettings(
			$this->optionName,
			$scope,
			$this->defaultSettings,
			array($this, 'createSettingInstances'),
			true,
			$this->lastModifiedSettingEnabled
		);
		$this->settings->addReadAliases($this->getSettingAliases());

		return $this->settings;
	}

	public function saveSettings() {
		if ( !$this->settingsWrapperEnabled ) {
			parent::saveSettings();
			return;
		}

		if ( $this->settings ) {
			$this->settings->save();
		}
	}

	public function createSettingInstances(ModuleSettings $settings) {
		//Subclasses should override this to create Setting instances.
		return array();
	}

	protected function getSettingAliases() {
		return array();
	}

	/**
	 * @param array $importedData
	 * @internal
	 */
	public function handleDataImport($importedData) {
		//Action: admin_menu_editor-import_data
		if ( !empty($this->moduleId) && isset($importedData, $importedData[$this->moduleId]) ) {
			$this->importSettings($importedData[$this->moduleId]);
		}
	}

	public function exportSettings() {
		if ( isset($this->moduleId) ) {
			if ( $this->settingsWrapperEnabled ) {
				$settings = $this->loadSettings();
				if ( $settings instanceof AbstractSettingsDictionary ) {
					return $settings->toArray();
				} else {
					return null;
				}
			} else {
				return $this->loadSettings();
			}
		}
		return null;
	}

	public function importSettings($newSettings) {
		if ( !is_array($newSettings) || empty($newSettings) ) {
			return;
		}

		$this->mergeSettingsWith($newSettings);
		$this->saveSettings();
	}

	public function mergeSettingsWith($newSettings) {
		if ( !$this->settingsWrapperEnabled ) {
			return parent::mergeSettingsWith($newSettings);
		}

		$settings = $this->loadSettings();
		$settings->mergeWith($newSettings);
		return $settings->toArray();
	}

	/**
	 * @return string
	 */
	public function getExportOptionLabel() {
		return $this->getTabTitle();
	}

	public function getExportOptionDescription() {
		return '';
	}
}