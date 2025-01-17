import number from '../utils/number-schema'

export const api = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(endpoint, options)
  if (!res.ok) {
    throw new Error(res.statusText)
  }
  return res.json() as Promise<T>
}

export const poll = (
  condition: () => Promise<boolean>,
  callback: () => void,
  errback: (arg0: Error) => void,
  timeout: number = 120000,
  interval: number = 1000
) => {
  const endTime = Date.now() + timeout
  ;(async function p() {
    const time = Date.now()
    const done = await condition()
    if (done) {
      callback()
    } else if (time < endTime) {
      setTimeout(p, interval)
    } else {
      errback(new Error(`Timed out`))
    }
  })()
}

const numberSchema = number()
  .typeError('Must be a number')
  .integer('Must be an integer')
  .min(0, 'Must be a positive number')
  .required('Required')

export const testNumber = (
  max?: number,
  message?: string
): ((value: number) => Promise<string | undefined>) => {
  const schema = max
    ? numberSchema.concat(
        number().max(max, message || `Must be smaller than ${max}`)
      )
    : numberSchema

  return async (value: unknown) => {
    try {
      await schema.validate(value)
    } catch (error) {
      return error.errors[0]
    }
  }
}

export const asyncForEach = async <T>(
  array: T[],
  callback: (value: T, index: number, array: T[]) => Promise<void>
) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export const openQR = (id: string, name: string) => {
  const qr: HTMLCanvasElement | null = document.querySelector(
    `#qr-${id} > canvas`
  )
  /* istanbul ignore else */
  if (qr) {
    const url = qr.toDataURL()
    let windowContent = `<!DOCTYPE html>
    <html>
    <head><title>Print QR Code for Audit: ${name}</title></head>
    <body>
    <img src="${url}">
    </body>
    </html>`

    const printWin = window.open(
      '',
      '',
      'width=' +
        window.screen.availWidth +
        ',height=' +
        window.screen.availHeight
    ) as Window
    printWin.document.open()
    printWin.document.write(windowContent)

    printWin.document.addEventListener(
      'load',
      () => {
        printWin.focus()
        printWin.print()
        printWin.document.close()
        printWin.close()
      },
      true
    )
  }
}
