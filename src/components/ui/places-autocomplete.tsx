"use client";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

interface PlacesAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (data: { address: string; city: string; lat: number; lng: number }) => void;
    disabled?: boolean;
    placeholder?: string;
    searchTypes?: string[];
}

export function PlacesAutocompleteWrapper(props: PlacesAutocompleteProps) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", 
        libraries,
    });

    if (loadError) return <div className="text-red-500 text-xs">Error loading maps</div>;
    if (!isLoaded) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;

    return <PlacesAutocomplete {...props} />;
}


import { Input } from "@/components/ui/input";

function PlacesAutocomplete({ value, onChange, onSelect, disabled, placeholder, searchTypes }: PlacesAutocompleteProps) {
  const [open, setOpen] = useState(false);

  const {
    ready,
    value: searchValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: searchTypes,
      componentRestrictions: { country: "bd" } // Optional: restrict to Bangladesh if desired, or remove
    },
    debounce: 300,
    initOnMount: true,
  });

  // Sync external value with internal state
  useEffect(() => {
     if (value && value !== searchValue) {
         setValue(value, false);
     }
  }, [value, setValue]);

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions(); // Clear suggestions to close list
    onChange(address);
    setOpen(false);

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      let city = "";
      const addressComponents = results[0].address_components;
      for (const component of addressComponents) {
        if (component.types.includes("locality")) {
            city = component.long_name;
            break;
        }
        if (!city && component.types.includes("administrative_area_level_1")) {
             city = component.long_name;
        }
      }
      onSelect({ address, city, lat, lng });

    } catch (error) {
      console.error("Error: ", error);
      toast.error("Failed to get location details");
    }
  };

  return (
    <div className="relative group">
       <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
              value={searchValue}
              onChange={(e) => {
                  setValue(e.target.value);
                  onChange(e.target.value); // Allow free typing update
              }}
              disabled={!ready || disabled}
              placeholder={placeholder || "Search location..."}
              className="pl-9 h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all"
              onFocus={() => setOpen(true)}
              onBlur={() => {
                  // Delay closing to allow click event on item
                  setTimeout(() => setOpen(false), 200);
              }}
          />
       </div>

      {status === "OK" && open && (
        <div className="absolute top-full left-0 w-full mt-2 z-50 overflow-hidden rounded-xl border border-border/50 bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
           <ul className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
             {data.map(({ place_id, description }) => (
                <li
                  key={place_id}
                  onClick={() => handleSelect(description)}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <MapPin className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  {description}
                </li>
             ))}
           </ul>
        </div>
      )}
    </div>
  );
}
