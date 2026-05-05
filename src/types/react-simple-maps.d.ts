declare module 'react-simple-maps' {
  import type {
    ComponentType,
    CSSProperties,
    MouseEvent,
    ReactNode,
    SVGProps,
  } from 'react';

  export interface GeographyFeature {
    rsmKey: string;
    properties: Record<string, unknown> & {
      ISO_A3?: string;
      ADM0_A3?: string;
      iso_a3?: string;
      adm0_a3?: string;
      name?: string;
    };
    geometry: unknown;
    type?: string;
  }

  export interface ComposableMapProps extends SVGProps<SVGSVGElement> {
    projection?: string | ((...args: unknown[]) => unknown);
    projectionConfig?: Record<string, unknown>;
    width?: number;
    height?: number;
    children?: ReactNode;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;

  export interface GeographiesRenderArgs {
    geographies: GeographyFeature[];
    outline?: unknown;
    borders?: unknown;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (args: GeographiesRenderArgs) => ReactNode;
  }

  export const Geographies: ComponentType<GeographiesProps>;

  export interface GeographyStyle {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  }

  export interface GeographyProps
    extends Omit<SVGProps<SVGPathElement>, 'style'> {
    geography: GeographyFeature;
    style?: GeographyStyle;
    onMouseEnter?: (event: MouseEvent<SVGPathElement>) => void;
    onMouseLeave?: (event: MouseEvent<SVGPathElement>) => void;
    onMouseMove?: (event: MouseEvent<SVGPathElement>) => void;
    onClick?: (event: MouseEvent<SVGPathElement>) => void;
  }

  export const Geography: ComponentType<GeographyProps>;

  export const Marker: ComponentType<Record<string, unknown>>;
  export const Annotation: ComponentType<Record<string, unknown>>;
  export const Graticule: ComponentType<Record<string, unknown>>;
  export const Sphere: ComponentType<Record<string, unknown>>;
  export const ZoomableGroup: ComponentType<Record<string, unknown>>;
  export const Line: ComponentType<Record<string, unknown>>;
}
