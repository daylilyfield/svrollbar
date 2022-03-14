import '@testing-library/jest-dom'
import { fireEvent, render, waitForElementToBeRemoved } from '@testing-library/svelte'
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

    const { container } = render(Svroller)
    const viewport = container.querySelector('.svlr-viewport')

    await fireEvent.scroll(viewport)

    expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()

    jest.advanceTimersByTime(1000)
    jest.useRealTimers()

    await waitForElementToBeRemoved(container.querySelector('.v-scrollbar'))
  })
})
