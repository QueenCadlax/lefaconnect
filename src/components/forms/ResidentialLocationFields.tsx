import { City, Country, State } from "country-state-city";
import { useMemo, useState } from "react";
import { Field, Select, TextInput, Textarea } from "@/components/forms/fields";

type ResidentialLocationFieldsProps = {
  defaultCountry?: string;
  defaultRegion?: string;
  defaultDistrict?: string;
  addressName?: string;
  addressDefaultValue?: string;
  applicantWorkspace?: boolean;
};

export function ResidentialLocationFields({
  defaultCountry = "",
  defaultRegion = "",
  defaultDistrict = "",
  addressName = "address",
  addressDefaultValue = "",
  applicantWorkspace = false,
}: ResidentialLocationFieldsProps) {
  const countries = useMemo(() => Country.getAllCountries(), []);
  const initialCountry = countries.find((country) => country.name === defaultCountry);
  const initialRegion = State.getStatesOfCountry(initialCountry?.isoCode ?? "").find(
    (region) => region.name === defaultRegion,
  );
  const [countryName, setCountryName] = useState(defaultCountry);
  const [countryCode, setCountryCode] = useState(initialCountry?.isoCode ?? "");
  const [regionName, setRegionName] = useState(defaultRegion);
  const [regionCode, setRegionCode] = useState(initialRegion?.isoCode ?? "");
  const [districtName, setDistrictName] = useState(defaultDistrict);
  const regions = useMemo(() => State.getStatesOfCountry(countryCode), [countryCode]);
  const cities = useMemo(
    () => City.getCitiesOfState(countryCode, regionCode),
    [countryCode, regionCode],
  );

  return (
    <>
      <Field id="country" label="Country of residence" required>
        <Select
          id="country"
          name="country"
          required
          value={countryName}
          onChange={(event) => {
            setCountryName(event.target.value);
            setCountryCode(event.target.selectedOptions[0]?.dataset["code"] ?? "");
            setRegionName("");
            setRegionCode("");
            setDistrictName("");
          }}
        >
          <option value="">Select your country</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.name} data-code={country.isoCode}>
              {country.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="regionOrProvinceState" label="Region / province / state" required>
        {regions.length ? (
          <Select
            id="regionOrProvinceState"
            name="regionOrProvinceState"
            required
            value={regionName}
            onChange={(event) => {
              setRegionName(event.target.value);
              setRegionCode(event.target.selectedOptions[0]?.dataset["code"] ?? "");
              setDistrictName("");
            }}
          >
            <option value="">Select your region / province / state</option>
            {regions.map((region) => (
              <option key={region.isoCode} value={region.name} data-code={region.isoCode}>
                {region.name}
              </option>
            ))}
          </Select>
        ) : (
          <TextInput
            id="regionOrProvinceState"
            name="regionOrProvinceState"
            required
            value={regionName}
            onChange={(event) => setRegionName(event.target.value)}
            placeholder="Enter your region / province / state"
            disabled={!countryCode}
          />
        )}
      </Field>
      <Field id="districtOrCity" label="District / city">
        <Select
          id="districtOrCity"
          name="districtOrCity"
          value={districtName}
          onChange={(event) => setDistrictName(event.target.value)}
          disabled={!regionCode || cities.length === 0}
        >
          <option value="">
            {cities.length ? "Select your district / city" : "Select a region first"}
          </option>
          {cities.map((city) => (
            <option key={`${city.name}-${city.stateCode}`} value={city.name}>
              {city.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        id={addressName}
        label={applicantWorkspace ? "Residential address" : "Residential address"}
        required
        className="sm:col-span-2"
      >
        {applicantWorkspace ? (
          <textarea
            id={addressName}
            name={addressName}
            defaultValue={addressDefaultValue}
            className="min-h-24 w-full border border-input bg-transparent px-3 py-2 text-sm"
            required
          />
        ) : (
          <Textarea
            id={addressName}
            name={addressName}
            rows={3}
            required
            defaultValue={addressDefaultValue}
          />
        )}
      </Field>
    </>
  );
}
