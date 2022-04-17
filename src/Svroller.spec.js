import '@testing-library/jest-dom'
import { fireEvent, render, waitForElementToBeRemoved } from '@testing-library/svelte'
import { tick } from 'svelte'
import Svroller from './Svroller.svelte'

describe('Svroller.svelte', () => {
  it('instanticate component', async () => {
    class ResizeObserverMock {
      constructor() {
        this.observe = jest.fn()
        this.unobserve = jest.fn()
        this.disconnect = jest.fn()
      }
    }

    window.ResizeObserver = ResizeObserverMock

    const { container, component } = render(Svroller)

    expect(container).toBeDefined()
    expect(component).toBeDefined()
  })

  it('should make scrollbar visible or invisible when scrolling', async () => {
    jest.useFakeTimers()

    let resizeCallback

    class ResizeObserverMock {
      constructor(callback) {
        resizeCallback = callback
        this.observe = jest.fn()
        this.unobserve = jest.fn()
        this.disconnect = jest.fn()
      }
    }

    window.ResizeObserver = ResizeObserverMock

    const { container } = render(Svroller)
    const viewport = container.querySelector('.svlr-viewport')

    jest.spyOn(viewport, 'scrollHeight', 'get').mockImplementation(() => 200)
    jest.spyOn(viewport, 'clientHeight', 'get').mockImplementation(() => 100)

    resizeCallback([{}])

    await tick()

    await fireEvent.scroll(viewport)

    expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()

    jest.advanceTimersByTime(1000)
    jest.useRealTimers()

    await waitForElementToBeRemoved(container.querySelector('.v-scrollbar'))
  })
})
