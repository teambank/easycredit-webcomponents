package com.easycredit.prerender;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class FragmentGuard {
  private static final Pattern TAG_PATTERN = Pattern.compile("<\\s*([a-z][a-z0-9-]*)\\b", Pattern.CASE_INSENSITIVE);
  private static final Pattern WEBSHOP_ID_ATTR =
      Pattern.compile("webshop-id\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\"'=<>`]+))", Pattern.CASE_INSENSITIVE);
  private static final Pattern WEBSHOP_ID_VALUE = Pattern.compile("^[A-Za-z0-9._-]{1,64}$");

  private static final Set<String> ALLOWED_COMPONENTS = Set.of(
      "easycredit-accordion",
      "easycredit-accordion-item",
      "easycredit-base",
      "easycredit-box-flash",
      "easycredit-box-listing",
      "easycredit-box-modal",
      "easycredit-box-top",
      "easycredit-checkout",
      "easycredit-checkout-bill-payment-timeline",
      "easycredit-checkout-installments",
      "easycredit-checkout-label",
      "easycredit-checkout-privacy-approval",
      "easycredit-checkout-totals",
      "easycredit-express-button",
      "easycredit-express-button-single",
      "easycredit-faq",
      "easycredit-infopage",
      "easycredit-logo",
      "easycredit-merchant-manager",
      "easycredit-merchant-status-widget",
      "easycredit-modal",
      "easycredit-widget"
  );

  private final int maxComponents;

  FragmentGuard(int maxComponents) {
    this.maxComponents = maxComponents;
  }

  void validate(String html) {
    List<String> easycreditTags = new ArrayList<>();
    Matcher tagMatcher = TAG_PATTERN.matcher(html);
    while (tagMatcher.find()) {
      String tag = tagMatcher.group(1).toLowerCase(Locale.ROOT);
      if (tag.startsWith("easycredit-")) {
        easycreditTags.add(tag);
      }
    }

    if (easycreditTags.isEmpty()) {
      throw new GuardException(400, "no easycredit component in html");
    }
    if (easycreditTags.size() > maxComponents) {
      throw new GuardException(400, "too many components in html");
    }
    for (String tag : easycreditTags) {
      if (!ALLOWED_COMPONENTS.contains(tag)) {
        throw new GuardException(400, "component not allowed: " + tag);
      }
    }

    Matcher webshopMatcher = WEBSHOP_ID_ATTR.matcher(html);
    if (webshopMatcher.find()) {
      String id = firstNonEmpty(webshopMatcher.group(1), webshopMatcher.group(2), webshopMatcher.group(3));
      if (id != null && !id.isBlank() && !WEBSHOP_ID_VALUE.matcher(id.trim()).matches()) {
        throw new GuardException(400, "invalid webshop id");
      }
    }
  }

  private static String firstNonEmpty(String... values) {
    for (String value : values) {
      if (value != null && !value.isEmpty()) {
        return value;
      }
    }
    return null;
  }

  static final class GuardException extends RuntimeException {
    final int status;

    GuardException(int status, String message) {
      super(message);
      this.status = status;
    }
  }
}
