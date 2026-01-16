"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Loader2, HeartPulse, ArrowLeft } from "lucide-react";
import { createRequest } from "../actions";

export default function AdminCreateRequestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_name: "",
    blood_group: "",
    units: "1",
    hospital: "",
    city: "",
    contact_number: "",
    urgency: "planned",
    notes: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setGettingLocation(false);
        toast.success("Location detected successfully");
      },
      (error) => {
        console.error(error);
        toast.error("Unable to retrieve your location");
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createRequest({
        patient_name: formData.patient_name,
        blood_group: formData.blood_group,
        units: parseInt(formData.units),
        hospital: formData.hospital,
        city: formData.city,
        contact_number: formData.contact_number,
        urgency: formData.urgency,
        notes: formData.notes,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      toast.success("Blood request created successfully!");
      router.push("/admin/blood-requests");
    } catch (error: any) {
      console.error("Error creating request:", error);
      toast.error(error.message || "Failed to create blood request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" space-y-6">
       
       <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
              <h1 className="text-3xl font-display font-bold">New Blood Request</h1>
              <p className="text-muted-foreground">Manually create a request for a patient.</p>
          </div>
       </div>

      <Card className="glass-card border-border/50 shadow-sm max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <HeartPulse className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-display">Patient Details</CardTitle>
          </div>
          <CardDescription>
             Enter the details received from the patient or hospital.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Patient Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_name">Patient Name</Label>
                <Input
                  id="patient_name"
                  name="patient_name"
                  required
                  placeholder="e.g. Rohim Uddin"
                  value={formData.patient_name}
                  onChange={handleInputChange}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select 
                  name="blood_group" 
                  onValueChange={(val) => handleSelectChange("blood_group", val)}
                  required
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Urgency & Units */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select 
                  name="urgency" 
                  defaultValue="planned"
                  onValueChange={(val) => handleSelectChange("urgency", val)}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Select Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned" className="text-blue-500">Planned (Surgery/Routine)</SelectItem>
                    <SelectItem value="urgent" className="text-orange-500 font-medium">Urgent (&lt; 24 Hours)</SelectItem>
                    <SelectItem value="critical" className="text-red-600 font-bold">Critical (Immediate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                 <Label htmlFor="units">Units Required</Label>
                 <Input 
                    id="units"
                    name="units"
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.units}
                    onChange={handleInputChange}
                    className="bg-secondary/50"
                 />
              </div>
            </div>

            {/* Hospital & Location */}
            <div className="space-y-2">
               <Label>Hospital / Location</Label>
               <div className="flex gap-2">
                 <Input 
                    name="hospital"
                    placeholder="Hospital Name / Address"
                    required
                    value={formData.hospital}
                    onChange={handleInputChange}
                    className="bg-secondary/50 flex-1"
                 />
                 <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={getLocation}
                    disabled={gettingLocation}
                    title="Use my current location"
                    className={formData.latitude ? "text-primary border-primary" : ""}
                 >
                    {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                 </Button>
               </div>
               {formData.latitude && (
                 <p className="text-xs text-green-500 flex items-center gap-1">
                   <MapPin className="w-3 h-3" /> Location coordinates attached
                 </p>
               )}
            </div>

            {/* City (Manual for now to help filtering) */}
            <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  required
                  placeholder="e.g. Dhaka"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="bg-secondary/50"
                />
            </div>

            {/* Contact */}
            <div className="space-y-2">
                <Label htmlFor="contact_number">Primary Contact Number</Label>
                <Input
                  id="contact_number"
                  name="contact_number"
                  required
                  placeholder="+880 1..."
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  className="bg-secondary/50"
                />
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes / Message</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Please state patient condition or specific instructions..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="bg-secondary/50"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" className="px-8 btn-primary" disabled={isLoading}>
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                    </>
                ) : (
                    "Create Request"
                )}
                </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
