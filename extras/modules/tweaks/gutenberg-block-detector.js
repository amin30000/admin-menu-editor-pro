/**
 * @property {Object} window.wsAmeGutenbergBlockData
 * @property wp.domReady
 * @property wp.blocks
 * @property wp.blocks.getBlockTypes
 * @property wp.blocks.getCategories
 * @property wp.blocks.hasBlockSupport
 * @property window._wpLoadBlockEditor
 * @property window._wpLoadGutenbergEditor
 */

if (typeof wp !== 'undefined' && typeof wp.domReady !== 'undefined') {
	wp.domReady(function () {
		let loadGutenberg = null;
		if (typeof window._wpLoadBlockEditor !== 'undefined') {
			loadGutenberg = window._wpLoadBlockEditor;
		} else if (typeof window._wpLoadGutenbergEditor !== 'undefined') {
			loadGutenberg = window._wpLoadGutenbergEditor;
		}

		if ((loadGutenberg === null) || (typeof loadGutenberg.then === 'undefined')) {
			return;
		}

		const scriptData = (typeof window.wsAmeGutenbergBlockData !== 'undefined')
			? window.wsAmeGutenbergBlockData
			: null;

		//We must have the AJAX URL and an update nonce to save detected blocks.
		//If we don't have those, this script can't do anything.
		if (!scriptData) {
			return;
		}

		//Wait for Gutenberg to load.
		loadGutenberg.then(function () {
			setTimeout(function () {
				if (
					(typeof wp.blocks === 'undefined')
					|| (typeof wp.blocks.getBlockTypes === 'undefined')
					|| (typeof wp.blocks.getCategories === 'undefined')
				) {
					return;
				}

				let hasNewData = false;

				//We're using arrays instead of objects because we want to preserve item order.
				let registeredBlocks = [];
				const blocks = wp.blocks.getBlockTypes();
				for (let i = 0; i < blocks.length; i++) {
					const block = blocks[i];

					const blockInfo = {
						name: block.name,
						title: block.title,
						category: block.category
					};

					//Keep track of which blocks don't appear in the inserter. We may need them
					//for compatibility, but we won't offer the user the option to hide them.
					if (
						wp.blocks.hasBlockSupport
						&& !wp.blocks.hasBlockSupport(block, 'inserter', true)
					) {
						blockInfo.supportsInserter = false;
					}

					registeredBlocks.push(blockInfo);

					if (!scriptData.knownBlocks.hasOwnProperty(block.name)) {
						hasNewData = true;
					}
				}

				let registeredCategories = [],
					categories = wp.blocks.getCategories();
				for (let j = 0; j < categories.length; j++) {
					registeredCategories.push({
						slug: categories[j].slug,
						title: categories[j].title,
					});

					if (!scriptData.knownCategories.hasOwnProperty(categories[j].slug)) {
						hasNewData = true;
					}
				}

				if (hasNewData && scriptData.updateNonce && scriptData.ajaxAction) {
					//Save the registered blocks and categories.
					jQuery.post(
						scriptData.ajaxUrl,
						{
							action: scriptData.ajaxAction,
							_ajax_nonce: scriptData.updateNonce,
							blocks: JSON.stringify(registeredBlocks),
							categories: JSON.stringify(registeredCategories)
						}
					);
				}
			}, 50);
		});

	});
}