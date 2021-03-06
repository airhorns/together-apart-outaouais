import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import dynamic from "next/dynamic";
import { StyledSpinnerNext } from "baseui/spinner";
import { toaster } from "baseui/toast";
import { Layout } from "../components/layout/Layout";
import { Meta } from "../components/Meta";
import { Button } from "baseui/button";
import { api } from "../lib/api";
import { Row } from "../components/Row";
import { Input } from "../components/form/Input";
import { Textarea } from "../components/form/Textarea";
import { OpaqueNotification } from "../components/OpaqueNotification";
import { useStyletron } from "baseui";
import { GetStaticProps } from "next";
import { $backend } from "../lib/backend";
import { values, sortBy, isString } from "lodash-es";
import { HeroCallout } from "../components/HeroCallout";
import { Heading, HeadingLevel } from "baseui/heading";
import { Select } from "../components/form/Select";
import { FormControl } from "baseui/form-control";
import { GroupableCheckbox } from "../components/form/Checkbox";
import { CheckboxProps } from "baseui/checkbox";
import { StaticLink } from "../components/StaticLink";
import { CurrentSite } from "../lib/sites";
import { NarrowContainer } from "../components/layout/NarrowContainer";
import { Tags } from "../components/form/Tags";
import { StaticTags } from "../lib/StaticTags";

const Confetti = dynamic(() => import("../components/Confetti"), { ssr: false });

export interface SubmitFormValues {
  name: string;
  submitterEmail: string;
  websiteURL: string;
  location: null | { id: string; label: string };
  category: null | { id: string; label: string };
  tags: { id: string; label: string }[];
  description: string;
  imageURL: string;
  instagramProfileURL: string;
  facebookPageURL: string;
  twitterProfileURL: string;
  giftCardURL: string;
  onlineStoreURL: string;
  supportsTakeout: boolean;
  supportsDelivery: boolean;
  sellsFood: boolean;
  phoneNumber: string;
  orderFoodURL: string;
  orderGroceriesURL: string;
  supportsUberEats: boolean;
  supportsSkipTheDishes: boolean;
  supportsGrubHub: boolean;
  supportsFoodora: boolean;
  supportsDoorDash: boolean;
  orderingInstructions: string;
  donationsURL: string;
  siteID: string;
  siteName: string;
}

const URLKeys: (keyof SubmitFormValues)[] = [
  "websiteURL",
  "imageURL",
  "facebookPageURL",
  "instagramProfileURL",
  "twitterProfileURL",
  "giftCardURL",
  "onlineStoreURL",
  "donationsURL",
];

const invalidURLMessage = "Invalid URL. Please include the http or https bit and the domain.";
const checkboxRowOverrides: CheckboxProps["overrides"] = { Root: { style: { marginRight: "1em" } } };

export const SubmitForm = (props: {
  locations: Option[];
  categories: Option[];
  tagOptions: Option[];
  onSuccess: (values: SubmitFormValues) => void;
}) => {
  const [css, $theme] = useStyletron();

  return (
    <div
      className={css({
        paddingLeft: $theme.sizing.scale400,
        paddingRight: $theme.sizing.scale400,
      })}
    >
      <Formik<SubmitFormValues>
        initialValues={{
          name: "",
          submitterEmail: "",
          websiteURL: "",
          location: null,
          category: null,
          tags: [],
          description: "",
          imageURL: "",
          instagramProfileURL: "",
          facebookPageURL: "",
          twitterProfileURL: "",
          giftCardURL: "",
          onlineStoreURL: "",
          supportsTakeout: false,
          supportsDelivery: false,
          sellsFood: false,
          phoneNumber: "",
          orderFoodURL: "",
          orderGroceriesURL: "",
          supportsUberEats: false,
          supportsSkipTheDishes: false,
          supportsGrubHub: false,
          supportsFoodora: false,
          supportsDoorDash: false,
          orderingInstructions: "",
          donationsURL: "",
          siteID: CurrentSite.webflowID,
          siteName: CurrentSite.regionName,
        }}
        validationSchema={Yup.object({
          name: Yup.string().max(100, "Must be 100 characters or less").required("Required"),
          description: Yup.string().max(200, "Must be 200 characters or less").required("Required"),
          submitterEmail: Yup.string().email("Invalid email address"),
          websiteURL: Yup.string().url(invalidURLMessage),
          imageURL: Yup.string().url(invalidURLMessage),
          instagramProfileURL: Yup.string().url(invalidURLMessage),
          facebookPageURL: Yup.string().url(invalidURLMessage),
          twitterProfileURL: Yup.string().url(invalidURLMessage),
          giftCardURL: Yup.string().url(invalidURLMessage),
          onlineStoreURL: Yup.string().url(invalidURLMessage),
          donationsURL: Yup.string().url(invalidURLMessage),
          location: Yup.mixed().required("Required"),
          category: Yup.mixed().required("Required"),
        })}
        onSubmit={async (values, helpers) => {
          const blob = { ...values, tags: values.tags.map((value) => value.label).join(", ") };

          // Massage URL keys to be more amenable to webflow's needs when POSTing
          URLKeys.forEach((key) => {
            const val = blob[key];
            if (val && isString(val)) {
              (blob as any)[key] = val.toLowerCase();
            }
          });

          try {
            await api.post("/submit", blob);
            props.onSuccess(values);
          } catch (e) {
            toaster.negative("There was an error submitting your form. Please try again.", { autoHideDuration: 3000 });
          }
          helpers.setSubmitting(false);
        }}
      >
        {(formik) => (
          <Form className={css({ position: "relative" })}>
            <HeadingLevel>
              <Heading>Submit a Business</Heading>
              <Input<SubmitFormValues> label="Business Name" id="name" attribute="name" />
              <Input<SubmitFormValues>
                label="Update Contact Details"
                id="submitterEmail"
                attribute="submitterEmail"
                placeholder="hello@example.com"
                caption="We'd love to keep in touch to ask questions and make updates to this listing as things change. What's your email? We won't share or sell it."
              />
              <Input<SubmitFormValues>
                label="Business Website URL"
                id="websiteURL"
                attribute="websiteURL"
                placeholder="http://example.com"
              />
              <Input<SubmitFormValues>
                label="Business Phone Number"
                id="phoneNumber"
                attribute="phoneNumber"
                placeholder="(613) 111-2233"
              />
              <Select<SubmitFormValues>
                label="Business Neighbourhood"
                id="location"
                attribute="location"
                placeholder="Select a neighbourhood ..."
                options={props.locations}
              />
              <Select<SubmitFormValues>
                label="Business Category"
                id="category"
                attribute="category"
                placeholder="Select a category ..."
                options={props.categories}
              />

              <Textarea<SubmitFormValues>
                label="Description"
                id="description"
                attribute="description"
                caption="Give a very short description of your business to explain to customers what you do."
              />

              <Tags<SubmitFormValues>
                label="Tags"
                id="tags"
                attribute="tags"
                caption="Select 1-15 tags describing this business to power search and categorization. Please try to use existing tags before creating new ones."
                options={props.tagOptions}
              />

              <Input<SubmitFormValues>
                label="Business Image URL"
                id="imageURL"
                attribute="imageURL"
                placeholder="http://example.com/some_image.jpg"
                caption={
                  "Rich imagery helps create a connection to potential customers. Please provide the URL to a high quality photo representing your business. We'll review it to make sure it fits with our site's theme."
                }
              />

              <HeadingLevel>
                <Heading>Social Links</Heading>
                <Input<SubmitFormValues>
                  label="Instagram Profile URL"
                  id="instagramProfileURL"
                  attribute="instagramProfileURL"
                  placeholder="http://www.instagram.com/a-business-name"
                  caption={"If the business has an Instagram profile, enter the URL."}
                />
                <Input<SubmitFormValues>
                  label="Facebook Page URL"
                  id="facebookPageURL"
                  attribute="facebookPageURL"
                  placeholder="http://www.facebook.com/a-business-name"
                  caption={"If the business has an Facebook profile, enter the URL."}
                />
                <Input<SubmitFormValues>
                  label="Twitter Profile URL"
                  id="twitterProfileURL"
                  attribute="twitterProfileURL"
                  placeholder="http://twitter.com/a-business-name"
                  caption={"If the business has an Twitter profile, enter the URL."}
                />
              </HeadingLevel>

              <HeadingLevel>
                <Heading>Online Store</Heading>
                <Input<SubmitFormValues>
                  label="Online Store URL"
                  id="onlineStoreURL"
                  attribute="onlineStoreURL"
                  placeholder="http://www.business-website.com/"
                  caption={"If the business has an online store selling goods or services, enter the URL."}
                />

                <Input<SubmitFormValues>
                  label="Gift Card Purchase URL"
                  id="giftCardURL"
                  attribute="giftCardURL"
                  placeholder="http://www.business-website.com/products/gift-cards"
                  caption={
                    "Many are asking for ways to support a business that is closed right now in the future, and selling gift cards is a great way to do that. If the business sells gift cards online, enter the URL here."
                  }
                />

                <FormControl
                  label="Ordering Options"
                  caption="If you take orders for physical goods, what are the different delivery methods available?"
                >
                  <Row>
                    <GroupableCheckbox<SubmitFormValues>
                      overrides={checkboxRowOverrides}
                      attribute="supportsDelivery"
                      label="Mail or Local Delivery"
                    />
                    <GroupableCheckbox<SubmitFormValues>
                      overrides={checkboxRowOverrides}
                      attribute="supportsTakeout"
                      label="Pickup In Store"
                    />
                  </Row>
                </FormControl>
              </HeadingLevel>

              <HeadingLevel>
                <Heading>Food Ordering Options</Heading>
                <GroupableCheckbox attribute="sellsFood" label="Do you sell food or groceries for pickup or delivery?" />
                <div className={css({ display: formik.values.sellsFood ? "block" : "none" })}>
                  <Input<SubmitFormValues>
                    label="Prepared Food Order URL"
                    id="orderFoodURL"
                    attribute="orderFoodURL"
                    placeholder="http://www.ubereats.com/ca/food-delivery/a-business-name"
                    caption="If customers can order prepared food online, enter the URL to place an order."
                  />
                  <Input<SubmitFormValues>
                    label="Groceries Order URL"
                    id="orderGroceriesURL"
                    attribute="orderGroceriesURL"
                    placeholder="http://www.yoursite.com/groceries/order"
                    caption="If customers can order groceries or other foodstuffs online, enter the URL to place an order."
                  />
                  <FormControl
                    label="Ordering Options"
                    caption="For orders made over the phone, online, or through an app, how can customers get up their order?"
                  >
                    <Row>
                      <GroupableCheckbox<SubmitFormValues>
                        overrides={checkboxRowOverrides}
                        attribute="supportsDelivery"
                        label="Local Delivery"
                      />
                      <GroupableCheckbox<SubmitFormValues>
                        overrides={checkboxRowOverrides}
                        attribute="supportsTakeout"
                        label="Takeout or Curbside Pickup"
                      />
                    </Row>
                  </FormControl>
                  <FormControl
                    label="Delivery Apps"
                    caption="Can customers use delivery apps to place orders? Please select all delivery apps that apply"
                  >
                    <Row>
                      <GroupableCheckbox<SubmitFormValues> overrides={checkboxRowOverrides} attribute="supportsUberEats" label="UberEats" />
                      <GroupableCheckbox<SubmitFormValues> overrides={checkboxRowOverrides} attribute="supportsGrubHub" label="GrubHub" />
                      <GroupableCheckbox<SubmitFormValues> overrides={checkboxRowOverrides} attribute="supportsFoodora" label="Foodora" />
                      <GroupableCheckbox<SubmitFormValues>
                        overrides={checkboxRowOverrides}
                        attribute="supportsSkipTheDishes"
                        label="Skip the Dishes"
                      />
                      <GroupableCheckbox<SubmitFormValues> overrides={checkboxRowOverrides} attribute="supportsDoorDash" label="DoorDash" />
                    </Row>
                  </FormControl>
                  <Textarea<SubmitFormValues>
                    label="Special Ordering Instructions"
                    id="orderingInstructions"
                    attribute="orderingInstructions"
                    caption="If customers need to follow any specific instructions when ordering please note them here."
                  />
                </div>
              </HeadingLevel>

              <HeadingLevel>
                <Heading>Donations</Heading>
                <Input<SubmitFormValues>
                  label="Donations URL"
                  id="donationsURL"
                  attribute="donationsURL"
                  placeholder="http://www.canadahelps.com/a-business-name"
                  caption="If this business (or non-profit) solicits donations using an online platform, enter the URL where donors can make donations"
                />
              </HeadingLevel>

              <Row>
                <Button data-testid="submit-business" type="submit" disabled={formik.isSubmitting} $style={{ marginRight: "1em" }}>
                  {formik.isSubmitting ? "Submitting ..." : "Submit"}
                </Button>
                {formik.isSubmitting && <StyledSpinnerNext />}
              </Row>
            </HeadingLevel>
          </Form>
        )}
      </Formik>
    </div>
  );
};

interface Option {
  id: string;
  label: string;
}

interface SubmitProps {
  locations: Option[];
  categories: Option[];
  tagOptions: Option[];
}

export default (props: SubmitProps) => {
  const [success, setSuccess] = React.useState(false);
  const [css] = useStyletron();

  return (
    <Layout>
      <Meta title="Submit A Business" />
      <HeroCallout heading={`${CurrentSite.regionName} gives its support.`}>
        Please use this form to submit a business for inclusion in the directory. We do our best to review and list every submission within
        24 hours.
        <br />‍<br />
        <strong>
          At this time, we will only be accepting businesses founded in the {CurrentSite.regionName} region for submissions.
        </strong>{" "}
        Thanks for your understanding!
        <br />
      </HeroCallout>
      <NarrowContainer>
        {!success && (
          <SubmitForm
            locations={props.locations}
            categories={props.categories}
            tagOptions={props.tagOptions}
            onSuccess={() => setSuccess(true)}
          />
        )}
        {success && (
          <OpaqueNotification
            title="Thanks!"
            message={
              <>
                Your submission has been received, we&apos;ll get back to you as soon as possible.
                <br />
                If you would like to revise this submission or have any questions, feel free to email us at{" "}
                <a className={css({ color: "black" })} href="mailto:hi@together-apart.ca">
                  hi@together-apart.ca
                </a>{" "}
                or{" "}
                <StaticLink href="/contact" className={css({ color: "black" })}>
                  contact us here.
                </StaticLink>
                <Confetti />
              </>
            }
            success
          />
        )}
      </NarrowContainer>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<SubmitProps> = async (_ctx) => {
  await $backend.prepare();

  return {
    props: {
      locations: sortBy(
        values($backend.currentSiteLocations).map((item) => ({ id: item._id, label: item.name })),
        "label"
      ),
      categories: sortBy(
        values($backend.categories).map((item) => ({ id: item._id, label: item.name })),
        "label"
      ),
      tagOptions: sortBy(
        StaticTags.map((tag) => ({ id: tag, label: tag })),
        "label"
      ),
    },
  };
};
