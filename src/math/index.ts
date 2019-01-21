export { Vector3 } from 'three'
export { Matrix4 } from 'three'
export { Quaternion } from 'three'

export const toRadian = (deg: number) => deg * (Math.PI / 180)

export function range(
  start: number,
  finish: number,
  step: number | undefined = 1
): Array<number> {
  const length = Math.abs(finish - start)
  if (length == 0) {
    return []
  }
  let result: Array<number> = new Array(length)
  const direction: number = start < finish ? 1 : start === finish ? 0 : -1

  for (
    var i = 0, value = start;
    i < length + 1;
    i = i + 1, value = value + step * direction
  ) {
    result[i] = value
  }

  return result
}
