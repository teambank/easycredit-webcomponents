import { Component, h, State, Prop } from '@stencil/core';
import { getWebshopInfo } from '../../utils/utils';
import { WebshopInfo } from '../../types';

@Component({
  tag: 'easycredit-checkout-privacy-approval',
  //styleUrl: 'easycredit-checkout-privacy-approval.scss',
  shadow: true,
})
export class EasycreditCheckoutPrivacyApproval {
  @Prop() webshopId: string;

  @State() privacyApprovalForm: string;
  @State() webshopInfo: WebshopInfo = null;

  async componentWillLoad() {
    try {
      this.webshopInfo = await getWebshopInfo(this.webshopId);
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    return [
      <div class="privacy">
        {/*<p><strong>Mit Klick auf Akzeptieren stimmen Sie der Datenübermittlung zu:</strong></p>*/}
        <div class="form-check">
          <label class="form-check-label" htmlFor="modalAgreement">
            {this.webshopInfo.privacyApprovalForm}
          </label>
        </div>
      </div>,
    ];
  }
}