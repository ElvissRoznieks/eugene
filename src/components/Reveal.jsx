import { useCallback } from 'react'
import useReveal from '../hooks/useReveal'
import { cx } from '../utils/dom'

function assignRef(ref, node) {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else ref.current = node
}

/**
 * First-look reveal — fades/slides in once when scrolled into view.
 * variant: up | right | left | scale
 */
export default function Reveal({
  ref: forwardedRef,
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  threshold = 0.12,
  immediate = false,
  className,
  children,
  style,
  ...rest
}) {
  const { ref, visible } = useReveal(threshold, { immediate })

  const setRef = useCallback(
    (node) => {
      ref.current = node
      assignRef(forwardedRef, node)
    },
    [ref, forwardedRef]
  )

  return (
    <Tag
      ref={setRef}
      className={cx('look', `look--${variant}`, visible && 'is-in', className)}
      style={{ '--look-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
