import type { Context } from '@deepseek-ai/cordis'
import { installRelationalMarkers } from '../../../shared/relational-markers.ts'

export function installFatFishRelationalMarkers(ctx: Context): void {
  installRelationalMarkers(ctx, [
    {
      // 0.2.0-rc.2 keeps the model picker's drilled pane on `role='group'` and
      // moves `role='menu'` onto its inner scroll list, so the container role
      // alone no longer identifies the menu surface.
      scope: "[class$='_menu']:is([role='menu'], [role='group'])",
      // 0.2.0-rc.2 replaced the provider title element with the shared
      // MenuGroup primitive; keep matching the older class for 0.1.7 hosts.
      rules: [
        { selector: ":scope:has([class$='_cell'])", attribute: 'data-fatfish-menu-cells' },
        { selector: ":scope:has([class$='_groupTitle'], [data-menu-group-heading])", attribute: 'data-fatfish-menu-groups' },
        { selector: ":scope:has([role='menuitemradio'] [class$='_modelName'])", attribute: 'data-fatfish-menu-models' },
        { selector: ":scope:has([class$='_cell'], [class$='_groupTitle'], [data-menu-group-heading], [role='menuitemradio'] [class$='_modelName'])", attribute: 'data-fatfish-model-menu' },
      ],
    },
    {
      scope: "[data-slot='sidebar']",
      rules: [{
        selector: ":scope > :first-child:has(> :is(button[data-dsh-part='sidebar-entry'], [data-plugin-entry], nav[class*='panelList']))",
        attribute: 'data-fatfish-sidebar-entries',
      }],
    },
  ])
}
