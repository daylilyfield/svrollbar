import '@testing-library/jest-dom/extend-expect'
import { fireEvent, render, waitFor } from '@testing-library/svelte'
import Svrollbar from './Svrollbar.svelte'

class ResizeObserverMock {
  constructor(cb) {
    this.observe = jest.fn()
    this.unobserve = jest.fn()
    this.disconnect = jest.fn()
    cb([{}])
  }
}

window.ResizeObserver = ResizeObserverMock

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

    const { container, unmount } = render(Svrollbar, {
      viewport,
      contents,
    })

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

  it('should hide scrollbar after specified milliseconds', async () => {
    jest.useFakeTimers()

    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    const { container, unmount } = render(Svrollbar, {
      viewport,
      contents,
    })

    await fireEvent.scroll(viewport)

    await waitFor(() => {
      expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()
    })

    jest.runTimersToTime(1000)

    await waitFor(() => {
      expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()
    })

    jest.runTimersToTime(2000)

    await waitFor(() => {
      expect(container.querySelector('.v-scrollbar')).not.toBeInTheDocument()
    })

    unmount()

    jest.useRealTimers()
  })

  it('should not hide the track when the track is entered', async () => {
    jest.useFakeTimers()

    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    const { container, unmount } = render(Svrollbar, {
      viewport,
      contents,
    })

    await fireEvent.scroll(viewport)
    await fireEvent.mouseEnter(container.querySelector('.v-track'))

    jest.runTimersToTime(1000)

    await waitFor(() => {
      expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()
    })

    await fireEvent.mouseLeave(container.querySelector('.v-track'))

    jest.runTimersToTime(2000)

    await waitFor(() => {
      expect(container.querySelector('.v-scrollbar')).not.toBeInTheDocument()
    })

    unmount()

    jest.useRealTimers()
  })

  it('should move contents down by dragging thumb', async () => {
    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    const { container, unmount } = render(Svrollbar, {
      viewport,
      contents,
    })

    await fireEvent.scroll(viewport)

    await waitFor(() => {
      expect(container.querySelector('.v-scrollbar')).toBeInTheDocument()
    })

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

    unmount()
  })

  it('should error when ResizeObserver is missing', () => {
    window.ResizeObserver = undefined

    const viewport = document.createElement('div')
    const contents = document.createElement('div')

    expect(
      render.bind(null, Svrollbar, {
        viewport,
        contents,
      })
    ).toThrow('window.ResizeObserver is missing.')
  })
})
