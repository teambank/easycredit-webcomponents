import { Component, h, Element, Method, Prop, Watch } from '@stencil/core';

@Component({
  tag: 'easycredit-modal',
  styleUrl: 'easycredit-modal.scss'
})
export class EasycreditModal {

  @Element() element: HTMLElement

  @Prop() loading: boolean = false
  @Prop() loadingMessage: string = 'Loading...'
  @Prop() show: boolean
  @Prop({ mutable: true }) isOpen = false

  @Watch('show') watchShowHandler(shown: boolean) {
    if (shown) {
      this.open();
    } else {
      this.close();
    }
  }

  @Method() async close() {
    this.isOpen = false
  }

  @Method() async open() {
    this.isOpen = true

    this.element.querySelectorAll('[data-src]').forEach((el) => {
      (el as any).src = (el as any).dataset.src
    })
  }

  @Method() async toggle () {
    (this.isOpen) ? this.close() : this.open()
  }

  getCloseIcon () {
    return <svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <g id="level0" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="level1" transform="translate(-874.000000, -447.000000)" fill="#000000">
          <g id="level2" transform="translate(874.482759, 447.448276)">
            <rect id="Rectangle" transform="translate(5.172414, 5.172414) rotate(-45.000000) translate(-5.172414, -5.172414) " x="-1.29310345" y="4.74137931" width="12.9310345" height="1" rx="0.5"></rect>
            <rect id="Rectangle" transform="translate(5.172414, 5.172414) rotate(45.000000) translate(-5.172414, -5.172414) " x="-1.29310345" y="4.74137931" width="12.9310345" height="1" rx="0.5"></rect>
          </g>
        </g>
      </g>
    </svg>
  }

  render() {
    return ([
        <div class={{'ec-modal': true, 'show': this.isOpen}}>
            <div class="close" onClick={() => this.close()}>
              {this.getCloseIcon()}
            </div>

            <h3 class="heading">
                <slot name="heading" />
            </h3>
            <slot name="content" />
        </div>,
        <div class={{'ec-modal-backdrop': true, 'show': this.isOpen}} onClick={() => this.close()} />
    ])
  }
}