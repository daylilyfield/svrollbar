import '@testing-library/jest-dom'
import { fireEvent, render, waitForElementToBeRemoved } from '@testing-library/svelte'
import Svrollbar from './Svrollbar.svelte'

class ResizeObserverMock {
  constructor(cb) {
    this.observe = jest.fn()
    this.unobserve = jest.fn()
    this.disconnect = jest.fn()
    cb([{}])
  }
}

beforeEach(() => {
  window.ResizeObserver = ResizeObserverMock
})

describe('Svrollbar.svelte', () => {
  it('instanticate component', async () => {
    const { container, component } = render(Svrollbar)

    expect(container).toBeDefined()
    expect(component).toBeDefined()
  })

  it('should make scrollbar visible or invisible when scrolling', async () => {
    jest.useFakeTimers()

    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    jest.spyOn(viewport, 'scrollHeight', 'get').mockImplementation(() => 200)
    jest.spyOn(viewport, 'clientHeight', 'get').mockImplementation(() => 100)

    const { container } = render(Svrollbar, {
      viewport,
      contents,
    })

    await fireEvent.scroll(viewport)

    expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()

    jest.advanceTimersByTime(1000)
    jest.useRealTimers()

    waitForElementToBeRemoved(container.querySelector('.v-scrollbar'))
  })

  it('should hide scrollbar after specified milliseconds', async () => {
    jest.useFakeTimers()

    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    jest.spyOn(viewport, 'scrollHeight', 'get').mockImplementation(() => 200)
    jest.spyOn(viewport, 'clientHeight', 'get').mockImplementation(() => 100)

    const { container } = render(Svrollbar, {
      viewport,
      contents,
    })

    await fireEvent.scroll(viewport)

    expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()

    jest.advanceTimersByTime(1000)

    expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()

    jest.advanceTimersByTime(2000)

    waitForElementToBeRemoved(container.querySelector('.v-scrollbar'))

    jest.useRealTimers()
  })

  it('should not hide the track when the track is entered', async () => {
    jest.useFakeTimers()

    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    jest.spyOn(viewport, 'scrollHeight', 'get').mockImplementation(() => 200)
    jest.spyOn(viewport, 'clientHeight', 'get').mockImplementation(() => 100)

    const { container } = render(Svrollbar, {
      viewport,
      contents,
    })

    await fireEvent.scroll(viewport)
    await fireEvent.mouseEnter(container.querySelector('.v-track'))

    jest.advanceTimersByTime(1000)

    expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()

    await fireEvent.mouseLeave(container.querySelector('.v-track'))

    jest.advanceTimersByTime(2000)

    waitForElementToBeRemoved(container.querySelector('.v-scrollbar'))

    jest.useRealTimers()
  })

  it('should move contents down by dragging thumb', async () => {
    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    jest.spyOn(viewport, 'scrollHeight', 'get').mockImplementation(() => 200)
    jest.spyOn(viewport, 'clientHeight', 'get').mockImplementation(() => 100)

    const { container } = render(Svrollbar, {
      viewport,
      contents,
    })

    await fireEvent.scroll(viewport)

    expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()

    const thumb = container.querySelector('.v-thumb')

    const spyAdd = jest.spyOn(document, 'addEventListener')
    const spyRemove = jest.spyOn(document, 'removeEventListener')

    await fireEvent.mouseDown(thumb)
    await fireEvent.mouseMove(document)
    await fireEvent.mouseUp(document)

    expect(spyAdd).toBeCalledTimes(4)

    const addedEvents = spyAdd.mock.calls.flatMap((it) => it[0])
    expect(addedEvents).toContain('mousemove')
    expect(addedEvents).toContain('touchmove')
    expect(addedEvents).toContain('mouseup')
    expect(addedEvents).toContain('touchend')

    expect(spyRemove).toBeCalledTimes(4)

    const removedEvents = spyRemove.mock.calls.flatMap((it) => it[0])
    expect(removedEvents).toContain('mousemove')
    expect(removedEvents).toContain('touchmove')
    expect(removedEvents).toContain('mouseup')
    expect(removedEvents).toContain('touchend')
  })

  it('should make scrollbar visible with alwaysVisible if contents > viewport', async () => {
    jest.useFakeTimers()

    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    jest.spyOn(viewport, 'scrollHeight', 'get').mockImplementation(() => 200)
    jest.spyOn(viewport, 'clientHeight', 'get').mockImplementation(() => 100)

    const { container } = render(Svrollbar, {
      viewport,
      contents,
      alwaysVisible: true,
    })

    await fireEvent.scroll(viewport)

    expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()

    jest.advanceTimersByTime(1000)
    jest.useRealTimers()

    expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()
  })

  it('should NOT make scrollbar visible with alwaysVisible if contents <= viewport', async () => {
    jest.useFakeTimers()

    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    jest.spyOn(viewport, 'scrollHeight', 'get').mockImplementation(() => 100)
    jest.spyOn(viewport, 'clientHeight', 'get').mockImplementation(() => 100)

    const { container } = render(Svrollbar, {
      viewport,
      contents,
      alwaysVisible: true,
    })

    await fireEvent.scroll(viewport)

    expect(container.querySelector('.v-scrollbar')).not.toBeInTheDocument()

    jest.advanceTimersByTime(1000)
    jest.useRealTimers()

    expect(container.querySelector('.v-scrollbar')).not.toBeInTheDocument()
  })

  it('should make scrollbar initialy visible with initialyVisible', async () => {
    jest.useFakeTimers()

    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    jest.spyOn(viewport, 'scrollHeight', 'get').mockImplementation(() => 200)
    jest.spyOn(viewport, 'clientHeight', 'get').mockImplementation(() => 100)

    const { container } = render(Svrollbar, {
      viewport,
      contents,
      initiallyVisible: true,
    })

    expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()

    await fireEvent.scroll(viewport)

    expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()

    jest.advanceTimersByTime(1000)
    jest.useRealTimers()

    waitForElementToBeRemoved(container.querySelector('.v-scrollbar'))
  })

  it('should error when ResizeObserver is missing', () => {
    window.ResizeObserver = undefined

    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    jest.spyOn(viewport, 'scrollHeight', 'get').mockImplementation(() => 200)
    jest.spyOn(viewport, 'clientHeight', 'get').mockImplementation(() => 100)

    expect(
      render.bind(null, Svrollbar, {
        viewport,
        contents,
      })
    ).toThrow('window.ResizeObserver is missing.')
  })

  it('should apply margin', () => {
    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    jest.spyOn(viewport, 'scrollHeight', 'get').mockImplementation(() => 200)
    jest.spyOn(viewport, 'clientHeight', 'get').mockImplementation(() => 100)

    const { container } = render(Svrollbar, {
      viewport,
      contents,
      alwaysVisible: true,
      margin: { top: 8, right: 16, bottom: 24, left: 32 },
    })

    const scrollbar = container.querySelector('.v-scrollbar')

    expect(scrollbar).toBeInTheDocument()
    expect(scrollbar).toHaveStyle({ 'margin-top': '8px' })
    expect(scrollbar).toHaveStyle({ 'margin-right': '16px' })
    expect(scrollbar).toHaveStyle({ 'margin-bottom': '24px' })
    expect(scrollbar).toHaveStyle({ 'margin-left': '32px' })
  })
})
