export interface EmailThread {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
  isUnread: boolean;
  isImportant: boolean;
  labels: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  attendees: string[];
  isAllDay: boolean;
}

export interface CityWeather {
  city: string;
  flag: string;
  emoji: string;
  label: string;
  current: number;
  high: number;
  low: number;
  rainChance: number | null;
}

export interface BriefingInput {
  emails: EmailThread[];
  yesterdayEvents: CalendarEvent[];
  todayEvents: CalendarEvent[];
  currentDate: string;
  timezone: string;
}

export interface DraftReply {
  originalSender: string;
  subject: string;
  draft: string;
}

export interface BriefingSections {
  yesterdaySummary: string;
  brandPartnerships: string;
  deadlines: string;
  todaysSchedule: string;
  pendingFollowups: string;
  draftReplies: DraftReply[];
  businessIdea: string;
}
