<?php
$result = [
	'sections' => [
		'profile'          => ['label' => 'Hide Profile Fields', 'priority' => 80],
		'sidebar-widgets'  => ['label' => 'Hide Sidebar Widgets', 'priority' => 100],
		'sidebars'         => ['label' => 'Hide Sidebars', 'priority' => 120],
		'environment-type' => ['label' => 'Environment Type', 'priority' => 30],
	],

	'tweaks' => [
		'hide-screen-meta-links' => [
			'label'            => 'Hide screen meta links',
			'selector'         => '#screen-meta-links',
			'hideableLabel'    => 'Screen meta links',
			'hideableCategory' => 'admin-ui',
		],
		'hide-screen-options'    => [
			'label'            => 'Hide the "Screen Options" button',
			'selector'         => '#screen-options-link-wrap',
			'parent'           => 'hide-screen-meta-links',
			'hideableLabel'    => '"Screen Options" button',
			'hideableCategory' => 'admin-ui',
		],
		'hide-help-panel'        => [
			'label'            => 'Hide the "Help" button',
			'selector'         => '#contextual-help-link-wrap',
			'parent'           => 'hide-screen-meta-links',
			'hideableLabel'    => '"Help" button',
			'hideableCategory' => 'admin-ui',
		],
		'hide-all-admin-notices' => [
			'label'            => 'Hide ALL admin notices',
			'selector'         => '#wpbody-content .notice, #wpbody-content .updated, #wpbody-content .update-nag',
			'hideableLabel'    => 'All admin notices',
			'hideableCategory' => 'admin-ui',
		],

		'hide-gutenberg-options'    => [
			'label'    => 'Hide the Gutenberg options menu (three vertical dots)',
			'selector' => '#editor .edit-post-header__settings .edit-post-more-menu,'
				. ' #editor .edit-post-header__settings .interface-more-menu-dropdown',
		],
		'hide-gutenberg-fs-wp-logo' => [
			'label'    => 'Hide the WordPress logo in Gutenberg fullscreen mode',
			'selector' => '#editor .edit-post-header a.components-button[href^="edit.php"]',
		],

		'show-environment-in-toolbar'  => [
			'label'       => 'Show environment type in the Toolbar',
			'section'     => 'environment-type',
			'className'   => 'ameEnvironmentNameTweak',
			'includeFile' => __DIR__ . '/ameEnvironmentNameTweak.php',
		],
		'environment-dependent-colors' => [
			'label'       => 'Change menu color depending on the environment',
			'section'     => 'environment-type',
			'className'   => 'ameEnvironmentColorTweak',
			'includeFile' => __DIR__ . '/ameEnvironmentColorTweak.php',
		],
	],
];

//region Profile tweaks
$profileScreens = ['profile'];
$profileSection = 'profile';
$profileTweaks = [
	'hide-profile-group-personal-info'   => [
		'label'   => 'Personal Info',
		'isGroup' => true,
	],
	'hide-profile-visual-editor'         => [
		'label'    => 'Visual Editor',
		'selector' => 'tr.user-rich-editing-wrap',
		'parent'   => 'hide-profile-group-personal-info',
	],
	'hide-profile-syntax-highlighting'   => [
		'label'    => 'Syntax Highlighting',
		'selector' => 'tr.user-syntax-highlighting-wrap',
		'parent'   => 'hide-profile-group-personal-info',
	],
	'hide-profile-color-scheme-selector' => [
		'label'    => 'Admin Color Scheme',
		'selector' => 'tr.user-admin-color-wrap',
		'parent'   => 'hide-profile-group-personal-info',
	],
	'hide-profile-keyboard-shortcuts'    => [
		'label'    => 'Keyboard Shortcuts',
		'selector' => 'tr.user-comment-shortcuts-wrap',
		'parent'   => 'hide-profile-group-personal-info',
	],
	'hide-profile-toolbar-toggle'        => [
		'label'    => 'Toolbar',
		'selector' => 'tr.show-admin-bar.user-admin-bar-front-wrap',
		'parent'   => 'hide-profile-group-personal-info',
	],

	'hide-profile-group-name'   => [
		'label'   => 'Name',
		'jquery-js' => 'jQuery("#profile-page tr.user-user-login-wrap").closest("table").prev("h2").addBack().hide();',
	],
	'hide-profile-user-login'   => [
		'label'    => 'Username',
		'selector' => 'tr.user-user-login-wrap',
		'parent'   => 'hide-profile-group-name',
	],
	'hide-profile-first-name'   => [
		'label'    => 'First Name',
		'selector' => 'tr.user-first-name-wrap',
		'parent'   => 'hide-profile-group-name',
	],
	'hide-profile-last-name'    => [
		'label'    => 'Last Name',
		'selector' => 'tr.user-last-name-wrap',
		'parent'   => 'hide-profile-group-name',
	],
	'hide-profile-nickname'     => [
		'label'    => 'Nickname',
		'selector' => 'tr.user-nickname-wrap',
		'parent'   => 'hide-profile-group-name',
	],
	'hide-profile-display-name' => [
		'label'    => 'Display name',
		'selector' => 'tr.user-display-name-wrap',
		'parent'   => 'hide-profile-group-name',
	],

	'hide-profile-group-contact-info' => [
		'label'   => 'Contact Info',
		'jquery-js' => 'jQuery("#profile-page tr.user-email-wrap").closest("table").prev("h2").addBack().hide();',
	],
	'hide-profile-email'              => [
		'label'    => 'Email',
		'selector' => 'tr.user-email-wrap',
		'parent'   => 'hide-profile-group-contact-info',
	],
	'hide-profile-url'                => [
		'label'    => 'Website',
		'selector' => 'tr.user-url-wrap',
		'parent'   => 'hide-profile-group-contact-info',
	],
];

//Find user contact methods and add them to the list of hideable profile fields.
if ( is_callable('wp_get_user_contact_methods') ) {
	$contactMethods = wp_get_user_contact_methods();
	foreach ($contactMethods as $contactMethodId => $contactMethod) {
		$profileTweaks['hide-profile-cm-' . $contactMethodId] = [
			'label'    => $contactMethod,
			'selector' => 'tr.user-' . $contactMethodId . '-wrap',
			'parent'   => 'hide-profile-group-contact-info',
		];
	}
}

//"About Yourself" section.
$profileTweaks = array_merge($profileTweaks, [
	'hide-profile-group-about-yourself' => [
		'label'   => 'About Yourself',
		'jquery-js' => 'jQuery("#profile-page tr.user-description-wrap").closest("table").prev("h2").addBack().hide();',
	],

	'hide-profile-user-description' => [
		'label'    => 'Biographical Info',
		'selector' => 'tr.user-description-wrap',
		'parent'   => 'hide-profile-group-about-yourself',
	],

	'hide-profile-picture' => [
		'label'    => 'Profile Picture',
		'selector' => 'tr.user-profile-picture',
		'parent'   => 'hide-profile-group-about-yourself',
	],
]);

foreach ($profileTweaks as $tweakId => $tweak) {
	$tweak['section'] = $profileSection;
	$tweak['screens'] = $profileScreens;
	$result['tweaks'][$tweakId] = $tweak;
}
//endregion

return $result;