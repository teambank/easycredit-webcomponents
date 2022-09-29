import { Component, h, State, Prop } from '@stencil/core';
import { fetchAgreement } from '../../utils/utils';

@Component({
  tag: 'easycredit-checkout-privacy-approval',
  //styleUrl: 'easycredit-checkout-privacy-approval.scss',
  shadow: true,
})

export class EasycreditCheckoutPrivacyApproval {
    @Prop() webshopId: string

    @State() privacyApprovalForm: string

    async componentWillLoad () {
          fetchAgreement(this.webshopId).then(data => {
            this.privacyApprovalForm = data.privacyApprovalForm
          }).catch(e => {
            console.error(e)
            // this.alert = 'Es ist ein Fehler aufgetreten.'
          })
        }

    render () {
      return ([
        <div class="privacy">
            {/*<p><strong>Mit Klick auf Akzeptieren stimmen Sie der Datenübermittlung zu:</strong></p>*/}
            <div class="form-check">
                <label class="form-check-label" htmlFor="modalAgreement">
                  <small>{ this.privacyApprovalForm }</small>
                </label>
            </div>
        </div>
      ])
    }
}