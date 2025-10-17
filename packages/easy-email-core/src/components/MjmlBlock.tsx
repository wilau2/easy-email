import React, { useMemo } from 'react';
import { BlockManager } from '@core/utils';
import { IBlockData, RecursivePartial } from '@core/typings';
import DOMPurify from 'dompurify';
import { set } from 'lodash';
import { useEmailRenderContext } from '@core/utils/JsonToMjml';

export interface MjmlBlockProps<T extends IBlockData> {
  idx?: string | null;
  type: T['type'];
  value?: RecursivePartial<T['data']['value']>;
  attributes?: RecursivePartial<T['attributes']>;
  children?: React.ReactNode;
}

export default function MjmlBlock<T extends IBlockData>({
  idx,
  value,
  type,
  attributes,
  children,
}: MjmlBlockProps<T>) {
  const { mode } = useEmailRenderContext();
  const block = BlockManager.getBlockByType(type);

  if (!block) {
    throw new Error(`Can no find ${type}`);
  }

  const mergeValue = useMemo((): undefined | {} => {
    if (typeof children === 'string') {
      const sanitizedContent = DOMPurify.sanitize(children);
      if (!value) {
        return {
          content: sanitizedContent,
        };
      } else {
        set(value, 'content', sanitizedContent);
        return value;
      }
    }

    // Sanitize content in value if it exists
    if (value && typeof (value as any).content === 'string') {
      const clonedValue = { ...value };
      set(clonedValue, 'content', DOMPurify.sanitize((value as any).content));
      return clonedValue;
    }

    return value;
  }, [children, value]);

  return (
    <>
      {block.render({
        idx: idx,
        mode: mode,
        data: {
          type: block.type,
          data: {
            value: mergeValue,
          },
          attributes,
          children: [],
        },
        children,
      })}
    </>
  );
}
