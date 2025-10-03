-- Update the handle_new_user function to create a sample trip
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  -- Insert Great Ocean Road sample trip
  INSERT INTO public.trips (user_id, title, start_date, end_date, trip_data)
  VALUES (
    new.id,
    'Great Ocean Road Adventure',
    '2024-06-15',
    '2024-06-17',
    '{
      "days": [
        {
          "id": "day-1",
          "date": "Jun 15, 2024",
          "drivingTime": "2h 30m",
          "activities": "Melbourne to Torquay and Bells Beach",
          "notes": "Start the famous Great Ocean Road journey",
          "stops": [
            {
              "id": "stop-1",
              "time": "9:00 AM",
              "location": "Melbourne - Federation Square",
              "type": "activity",
              "notes": "Breakfast and coffee before departure",
              "coordinates": [144.9685, -37.8180]
            },
            {
              "id": "stop-2",
              "time": "11:00 AM",
              "location": "Torquay",
              "type": "drive",
              "notes": "Gateway to the Great Ocean Road",
              "coordinates": [144.3292, -38.3339]
            },
            {
              "id": "stop-3",
              "time": "12:00 PM",
              "location": "Bells Beach",
              "type": "activity",
              "notes": "Famous surf spot, lunch at surf club",
              "coordinates": [144.2825, -38.3686]
            },
            {
              "id": "stop-4",
              "time": "3:00 PM",
              "location": "Lorne",
              "type": "stop",
              "notes": "Coastal town, beach walk and dinner",
              "coordinates": [143.9784, -38.5429]
            }
          ]
        },
        {
          "id": "day-2",
          "date": "Jun 16, 2024",
          "drivingTime": "2h 45m",
          "activities": "Apollo Bay and Cape Otway",
          "notes": "Rainforest and lighthouse exploration",
          "stops": [
            {
              "id": "stop-1",
              "time": "8:00 AM",
              "location": "Lorne Breakfast",
              "type": "stop",
              "coordinates": [143.9784, -38.5429]
            },
            {
              "id": "stop-2",
              "time": "9:30 AM",
              "location": "Apollo Bay",
              "type": "drive",
              "notes": "Scenic coastal drive with ocean views",
              "coordinates": [143.6711, -38.7571]
            },
            {
              "id": "stop-3",
              "time": "11:00 AM",
              "location": "Great Otway National Park",
              "type": "activity",
              "notes": "Rainforest walk and waterfalls",
              "coordinates": [143.5569, -38.7546]
            },
            {
              "id": "stop-4",
              "time": "2:00 PM",
              "location": "Cape Otway Lighthouse",
              "type": "activity",
              "notes": "Historic lighthouse and koala spotting",
              "coordinates": [143.5117, -38.8570]
            },
            {
              "id": "stop-5",
              "time": "5:00 PM",
              "location": "Port Campbell",
              "type": "stop",
              "notes": "Overnight stay in coastal village",
              "coordinates": [142.9921, -38.6167]
            }
          ]
        },
        {
          "id": "day-3",
          "date": "Jun 17, 2024",
          "drivingTime": "3h 30m",
          "activities": "Twelve Apostles and Shipwreck Coast",
          "notes": "The iconic limestone formations",
          "stops": [
            {
              "id": "stop-1",
              "time": "7:00 AM",
              "location": "Port Campbell Sunrise",
              "type": "stop",
              "coordinates": [142.9921, -38.6167]
            },
            {
              "id": "stop-2",
              "time": "8:00 AM",
              "location": "Twelve Apostles",
              "type": "activity",
              "notes": "Iconic rock formations at sunrise",
              "coordinates": [143.1043, -38.6656]
            },
            {
              "id": "stop-3",
              "time": "10:00 AM",
              "location": "Loch Ard Gorge",
              "type": "activity",
              "notes": "Dramatic coastal gorge and shipwreck history",
              "coordinates": [143.0915, -38.6725]
            },
            {
              "id": "stop-4",
              "time": "12:00 PM",
              "location": "London Bridge",
              "type": "activity",
              "notes": "Natural rock arch formation",
              "coordinates": [142.9877, -38.6369]
            },
            {
              "id": "stop-5",
              "time": "2:00 PM",
              "location": "Bay of Islands",
              "type": "activity",
              "notes": "Coastal viewpoint and photography",
              "coordinates": [142.9597, -38.6244]
            },
            {
              "id": "stop-6",
              "time": "4:00 PM",
              "location": "Warrnambool",
              "type": "stop",
              "notes": "End of Great Ocean Road, return to Melbourne",
              "coordinates": [142.4826, -38.3809]
            }
          ]
        }
      ]
    }'::jsonb
  );
  
  RETURN new;
END;
$$;