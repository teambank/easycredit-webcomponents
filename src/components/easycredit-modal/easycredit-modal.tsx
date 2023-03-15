import { Component, h, Element, Method, Prop, Watch, Event, EventEmitter, State } from '@stencil/core';

@Component({
  tag: 'easycredit-modal',
  styleUrl: 'easycredit-modal.scss',
  shadow: true,
})
export class EasycreditModal {

  @Element() element: HTMLElement

  @Prop() loading: boolean = false
  @Prop() loadingMessage: string = 'Loading...'
  @Prop() show: boolean
  @Prop({ mutable: true }) isOpen = false
  @Prop() size: string = ''

  @State() hasHeadingSlot: boolean = false
  @State() submittable: boolean = false
  @State() submitButtonClicked: boolean = false

  @Event() modalOpened: EventEmitter;
  @Event() modalClosed: EventEmitter;
  @Event() modalSubmit: EventEmitter;

  componentWillLoad() {
    this.hasHeadingSlot = !!this.element.querySelector('[slot="heading"]')
    this.submittable = !!this.element.querySelector('[slot="button"]')

    this.moveModal();
  }

  moveModal(): void {
    var target = document.querySelector('body');

    if (target && this.element) {
      target.insertBefore(this.element, target.lastChild);
    }
  }

  handleKeydown (e) {
    if (e.key == "Escape") {
      this.close()
    }
  }

  @Method() async open() {
    this.isOpen = true
    document.addEventListener('keydown', this.handleKeydown.bind(this))

    this.element.querySelectorAll('[data-src]').forEach((el) => {
      (el as any).src = (el as any).dataset.src
    })
  }

  @Method() async close() {
    document.removeEventListener('keydown', this.handleKeydown.bind(this))

    this.isOpen = false
    this.submitButtonClicked = false
    this.modalClosed.emit();
  }

  @Method() async toggle () {
    (this.isOpen) ? this.close() : this.open()
  }

  @Method() async submit() {
    this.submitButtonClicked = true
    this.modalSubmit.emit();
  }

  @Watch('show') watchShowHandler(shown: boolean) {
    if (shown) {
      this.open();
    } else {
      this.close();
    }
  }

  getSubmitButtonFragment () {
    if (!this.submittable) {
      return
    }
    return ([
      <div class="form-submit">
        <button class={{ "btn": true, "btn-primary": true, "loading": this.submitButtonClicked }} type="button" onClick={() => { this.submit() }} disabled={this.submitButtonClicked}>
          <slot name="button">Absenden</slot>
        </button>
      </div>
    ]) 
  }

  getHeadingFragment () {
    if (!this.hasHeadingSlot) {
      return
    }
    return ([
      <h3 class="heading">
          <slot name="heading" />
      </h3>
    ])
  }

  render() {
    return ([
        <div class={{
          'ec-modal': true,
          'show': this.isOpen,
          ['size-' + this.size]: this.size !== ''
        }}>
            <div class="close" onClick={() => this.close()}></div>

            { this.getHeadingFragment() }
            <div class="content">
              <slot name="content" />
            </div>

            { this.getSubmitButtonFragment() }
        </div>,
        <div class={{'ec-modal-backdrop': true, 'show': this.isOpen}} onClick={() => this.close()} />
    ])
  }
}
