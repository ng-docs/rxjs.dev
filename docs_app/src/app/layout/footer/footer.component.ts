import { Component, Input } from '@angular/core';

import { NavigationNode, VersionInfo } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-footer',
  template: `<p>
      Code licensed under an <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache-2.0 License</a>. Documentation licensed under
      <a href="http://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
    </p>
    <p>Version {{ versionInfo?.full }}.</p>`,
})
export class FooterComponent {
  @Input() nodes: NavigationNode[];
  @Input() versionInfo: VersionInfo;
}
