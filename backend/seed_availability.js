import db from './db.js';

async function seedAvailability() {
  console.log('Starting availability seeding...');

  try {
    // Get workers with no availability
    const workers = await new Promise((resolve, reject) => {
      db.all(
        "SELECT uid, displayName FROM users WHERE role = 'worker' AND (availability IS NULL OR availability = '[]' OR availability = '')",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    console.log(`Found ${workers.length} workers to update.`);

    for (const worker of workers) {
      const availabilityDates = [];
      const isHighAvailability = Math.random() > 0.5;
      
      // Dates between current date + 10 days and current date + 370 days
      const startDateOffset = 10;
      const endDateOffset = 370;

      if (isHighAvailability) {
        // 6 days over 7: pick a random day off (Monday to Friday)
        const dayOff = Math.floor(Math.random() * 5) + 1; // 1 (Mon) to 5 (Fri)
        console.log(`Worker ${worker.displayName} (${worker.uid}): High availability (Day off: ${getDayName(dayOff)})`);
        
        for (let i = startDateOffset; i <= endDateOffset; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          if (date.getDay() !== dayOff) {
            availabilityDates.push(date.toISOString().split('T')[0]);
          }
        }
      } else {
        // Low availability: Saturday and Sunday only
        console.log(`Worker ${worker.displayName} (${worker.uid}): Weekend only availability`);
        
        for (let i = startDateOffset; i <= endDateOffset; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const day = date.getDay();
          if (day === 0 || day === 6) { // 0: Sunday, 6: Saturday
            availabilityDates.push(date.toISOString().split('T')[0]);
          }
        }
      }

      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET availability = ? WHERE uid = ?',
          [JSON.stringify(availabilityDates), worker.uid],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    console.log('Availability seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    db.close();
  }
}

function getDayName(day) {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
}

seedAvailability();
