import Image from "next/image";
import { BottleSvg } from "@/components/landing/bottle-svg";
import { productPhoto, type BottleColor, type Gama } from "@/lib/wines";

type Props = {
  code: string;
  name?: string;
  gama: Gama;
  color: BottleColor;
  /** Rendered pixel size (square). Used only for the raster <Image /> path. */
  size?: number;
  priority?: boolean;
};

/**
 * Preferă foto reală dacă e mapată în `productPhoto(code)`. Altfel cade
 * pe BottleSvg (util pentru gama „pauze" viitoare care nu are shoot încă).
 */
export function ProductBottle({ code, name, gama, color, size = 240, priority = false }: Props) {
  const photo = productPhoto(code);
  if (photo) {
    return (
      <Image
        className="product-photo"
        src={photo}
        alt={name ? `${name} — ${code}` : code}
        width={size}
        height={size}
        priority={priority}
      />
    );
  }
  return <BottleSvg color={color} gama={gama} code={code} />;
}
