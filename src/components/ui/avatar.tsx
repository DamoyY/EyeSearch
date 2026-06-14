import { Avatar as ArkAvatar } from "@ark-ui/react";
import { Globe } from "lucide-react";
import type { ReactElement } from "react";

import { cx } from "../../../styled-system/css";
import { avatar, type AvatarVariantProps } from "../../../styled-system/recipes";

interface AvatarProps extends AvatarVariantProps {
  className?: string;
  label: string;
  src: string;
}

export function Avatar({
  className,
  label,
  size,
  src,
}: AvatarProps): ReactElement {
  const styles = avatar({ size });

  return (
    <ArkAvatar.Root className={cx(styles.root, className)}>
      <ArkAvatar.Fallback className={styles.fallback}>
        <Globe aria-hidden="true" size="60%" />
      </ArkAvatar.Fallback>
      <ArkAvatar.Image alt={label} className={styles.image} src={src} />
    </ArkAvatar.Root>
  );
}
