import {
	createRendererComponentConfig,
	KoComponentParams,
	KoRendererViewModel
} from '../../../pro-customizables/ko-components/control-base.js';
import {AmeCustomizable} from '../../../pro-customizables/assets/customizable.js';
import Section = AmeCustomizable.Section;

class AmeAcStructure extends KoRendererViewModel {
	public readonly allSections: Section[] = [];

	constructor(params: KoComponentParams, $element: JQuery) {
		super(params, $element);

		const rootSection = new Section(
			{
				t: 'section',
				id: 'structure-root',
				title: this.structure.title ?? 'Root',
			},
			this.structure.children
		);

		//Recursively collect all sections.
		function collectChildSections(section: Section, accumulator: Section[] = []) {
			accumulator.push(section);
			for (const child of section.children) {
				if (child instanceof Section) {
					collectChildSections(child, accumulator);
				}
			}
			return accumulator;
		}

		this.allSections = collectChildSections(rootSection);

		//Give the breadcrumb list to each section, if available.
		if (typeof params.breadcrumbs !== 'undefined') {
			for (const section of this.allSections) {
				section.componentParams.breadcrumbs = params.breadcrumbs;
			}
		}
	}
}

export default createRendererComponentConfig(AmeAcStructure, `
	<!-- ko foreach: allSections -->
		<!-- ko component: {name: 'ame-ac-section', params: $data.getComponentParams()} --><!-- /ko -->
	<!-- /ko -->
`);