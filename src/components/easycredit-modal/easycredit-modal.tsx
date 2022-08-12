import { Component, h, Element, Method, Prop, Watch, Event, EventEmitter } from '@stencil/core';

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
    this.modalClosed.emit();
  }

  @Method() async open() {
    this.isOpen = true

    this.element.querySelectorAll('[data-src]').forEach((el) => {
      (el as any).src = (el as any).dataset.src
    })
  }

  @Event() modalOpened: EventEmitter;
  @Event() modalClosed: EventEmitter;

  @Method() async toggle () {
    (this.isOpen) ? this.close() : this.open()
  }

  render() {
    return ([
        <div class={{'ec-modal': true, 'show': this.isOpen}}>
            <div class="close" onClick={() => this.close()}></div>

            <h3 class="heading">
                <slot name="heading" />
            </h3>
            <slot name="content" />
        </div>,
        <div class={{'ec-modal-backdrop': true, 'show': this.isOpen}} onClick={() => this.close()} />
    ])
  }
}