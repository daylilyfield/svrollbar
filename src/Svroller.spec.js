import '@testing-library/jest-dom/extend-expect'
import { fireEvent, render, waitFor } from '@testing-library/svelte'
import Svroller from './Svroller.svelte'

class ResizeObserverMock {
  constructor() {
    this.observe = jest.fn()
    this.unobserve = jest.fn()
    this.disconnect = jest.fn()
  }
}

window.ResizeObserver = ResizeObserverMock

describe('Svroller.svelte', () => {
  it('instanticate component', async () => {
    const { container, component } = render(Svroller)

    expect(container).toBeDefined()
    expect(component).toBeDefined()
  })

  it('should make scrollbar visible or invisible when scrolling', async () => {
    jest.useFakeTimers()

    const { container, unmount } = render(Svroller)
    const viewport = container.querySelector('.viewport')

    await fireEvent.scroll(viewport)

    // because svrollbar add scroll event as **passive**,
    // we need to wait until scrollbar appears
    await waitFor(() => {
      expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()
    })

    jest.runTimersToTime(1000)

    await waitFor(() => {
      expect(container.querySelector('.v-scrollbar')).not.toBeInTheDocument()
    })

    unmount()

    jest.useRealTimers()
  })
})
