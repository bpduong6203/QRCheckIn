import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calendarApi } from '../../../api/calendarApi';
import { STORAGE_KEYS } from '../../../utils/constants';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        setError('User not found');
        return;
      }

      const [meetings, activities, evaluations] = await Promise.all([
        calendarApi.getUserMeetings(userId).catch(() => []),
        calendarApi.getUserActivities().catch(() => []),
        calendarApi.getTimeEvaluations().catch(() => [])
      ]);

      const allEvents = [...meetings, ...activities, ...evaluations]
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    const eventDate = new Date(date);
    return eventDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getEventColor = (event) => {
    switch(event.type) {
      case 'meeting':
        return '#e3f2fd';
      case 'activity':
        return '#fff3e0';
      case 'evaluation':
        return '#f3e5f5';
      default:
        return '#f5f5f5';
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadEvents}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateWeek(-1)}>
          <MaterialIcons name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => navigateWeek(1)}>
          <MaterialIcons name="chevron-right" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDay}>
            <Text style={[
              styles.weekDayText,
              index === 0 && styles.sundayText
            ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.gridContainer}>
        <View style={styles.grid}>
          {getWeekDates().map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentDay = isToday(date);
            return (
              <View 
                key={index} 
                style={[styles.dayCell, isCurrentDay && styles.todayCell]}
              >
                <Text style={[
                  styles.dayNumber,
                  isCurrentDay && styles.todayText
                ]}>
                  {date.getDate()}
                </Text>
                
                {dayEvents.map((event, eIndex) => (
                  <TouchableOpacity 
                    key={eIndex}
                    style={[
                      styles.eventItem,
                      { backgroundColor: getEventColor(event) }
                    ]}
                  >
                    <Text style={styles.eventTime}>
                      {formatTime(event.startTime)}
                    </Text>
                    <Text 
                      numberOfLines={1} 
                      style={styles.eventTitle}
                    >
                      {event.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 15,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f7',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e1e1',
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  weekDayText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  sundayText: {
    color: '#ff3b30',
  },
  gridContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#e1e1e1',
    padding: 5,
    alignItems: 'center',
  },
  todayCell: {
    backgroundColor: '#007aff',
  },
  dayNumber: {
    fontSize: 17,
    marginTop: 5,
    color: '#000',
  },
  todayText: {
    color: '#fff',
    fontWeight: '600',
  },
  eventItem: {
    padding: 4,
    borderRadius: 4,
    marginTop: 4,
    width: '100%',
  },
  eventTime: {
    fontSize: 11,
    color: '#666',
  },
  eventTitle: {
    fontSize: 12,
    color: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
  }
});

export default Calendar;