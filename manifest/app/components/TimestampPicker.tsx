"use client";

import { useState, useEffect } from "react";
import styles from "../styles/TimestampPicker.module.css";

interface TimestampPickerProps {
  minDate: number;
  maxDate?: number;
  value: number;
  onChange: (timestamp: number) => void;
  label?: string;
  helperText?: string;
}

export function TimestampPicker({
  minDate,
  maxDate,
  value,
  onChange,
  label = "Guess Event Timestamp",
  helperText = "When do you think this event will happen?",
}: TimestampPickerProps) {
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      const dateStr = date.toISOString().split("T")[0];
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      setDateValue(dateStr);
      setTimeValue(`${hours}:${minutes}`);
    } else {
      // Default to min date + 1 day
      const defaultDate = new Date(minDate + 24 * 60 * 60 * 1000);
      const dateStr = defaultDate.toISOString().split("T")[0];
      const hours = defaultDate.getHours().toString().padStart(2, "0");
      const minutes = defaultDate.getMinutes().toString().padStart(2, "0");
      setDateValue(dateStr);
      setTimeValue(`${hours}:${minutes}`);
      onChange(defaultDate.getTime());
    }
  }, []);

  const handleDateChange = (newDate: string) => {
    setDateValue(newDate);
    if (newDate && timeValue) {
      const timestamp = new Date(`${newDate}T${timeValue}`).getTime();
      if (!isNaN(timestamp)) {
        onChange(timestamp);
      }
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    if (dateValue && newTime) {
      const timestamp = new Date(`${dateValue}T${newTime}`).getTime();
      if (!isNaN(timestamp)) {
        onChange(timestamp);
      }
    }
  };

  // Calculate min/max date strings for input
  const minDateStr = new Date(minDate).toISOString().split("T")[0];
  const maxDateStr = maxDate
    ? new Date(maxDate).toISOString().split("T")[0]
    : new Date(minDate + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const formatPreviewDate = () => {
    if (!dateValue || !timeValue) return "";
    const date = new Date(`${dateValue}T${timeValue}`);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      {helperText && <p className={styles.helperText}>{helperText}</p>}

      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <label className={styles.inputLabel}>Date</label>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            min={minDateStr}
            max={maxDateStr}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.inputWrapper}>
          <label className={styles.inputLabel}>Time</label>
          <input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className={styles.input}
            required
          />
        </div>
      </div>

      {dateValue && timeValue && (
        <div className={styles.preview}>
          <span className={styles.previewLabel}>Your Prediction</span>
          <span className={styles.previewValue}>{formatPreviewDate()}</span>
        </div>
      )}
    </div>
  );
}

