export interface Greeting {
  title: string;
  subtitle: string;
}

// Khung giờ chào theo local time của trình duyệt — không có backend nên
// không biết múi giờ thật của người dùng ngoài giờ máy họ.
export function getTimeOfDayGreeting(hour: number): Greeting {
  if (hour >= 5 && hour < 12) {
    return { title: "Good morning", subtitle: "Fresh eyes, fresh start." };
  }
  if (hour >= 12 && hour < 18) {
    return { title: "Good afternoon", subtitle: "Time for a quick reset." };
  }
  if (hour >= 18 && hour < 22) {
    return {
      title: "Good evening",
      subtitle: "Wrapping up, one blink at a time.",
    };
  }
  return { title: "Still up?", subtitle: "Don't forget to rest your eyes too." };
}

export function greetingWithName(greeting: Greeting, name?: string): string {
  return name ? `${greeting.title}, ${name} 👋` : `${greeting.title} 👋`;
}
