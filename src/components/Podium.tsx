import Medal from "./Medal";

type Props = {
  winners: never[]; // We're not using this prop anymore, but keeping it for compatibility
  categoryName: string;
  animate?: boolean;
};

/**
 * Simple podium with three pedestals for placing winners
 */
export default function Podium({ categoryName }: Props) {
  console.log(`Rendering Podium for ${categoryName}`);

  // Pedestal component with medal at bottom
  const Pedestal = ({
    heightClass,
    widthClass,
    place,
  }: {
    heightClass: string;
    widthClass: string;
    place: 1 | 2 | 3;
  }) => {
    return (
      <div className="relative flex flex-col items-center">
        {/* Pedestal - simple solid color */}
        <div
          className={`${heightClass} ${widthClass} bg-amber-100 rounded-t-md`}
        >
          {/* Medal at bottom of pedestal */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <div className="bg-slate-800 p-1 rounded-full">
              <Medal place={place} size={64} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto py-12">
      {/* Podium base - static component, no animations */}
      <div className="relative w-full">
        {/* Row for the three pedestals - wide spacing */}
        <div className="flex justify-center items-end gap-20 md:gap-32">
          {/* Silver - 2nd place */}
          <Pedestal heightClass="h-40" widthClass="w-32" place={2} />

          {/* Gold - 1st place */}
          <Pedestal heightClass="h-56" widthClass="w-40" place={1} />

          {/* Bronze - 3rd place */}
          <Pedestal heightClass="h-28" widthClass="w-28" place={3} />
        </div>

        {/* Base plinth - simple solid color, no patterns or animations */}
        <div className="-bottom-8 left-0 right-0 h-16 bg-amber-100 rounded-md -z-10"></div>
      </div>
    </div>
  );
}
