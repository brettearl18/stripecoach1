<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <label className="block text-gray-300 mb-2">Open Day</label>
    <select
      value={openDay}
      onChange={e => setOpenDay(e.target.value)}
      className="w-full rounded-md bg-gray-900 border border-gray-700 text-gray-200 px-4 py-2"
    >
      {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
        <option key={day} value={day}>{day}</option>
      ))}
    </select>
  </div>
  <div>
    <label className="block text-gray-300 mb-2">Open Time</label>
    <input
      type="time"
      value={openTime}
      onChange={e => setOpenTime(e.target.value)}
      className="w-full rounded-md bg-gray-900 border border-gray-700 text-gray-200 px-4 py-2"
    />
  </div>
  <div>
    <label className="block text-gray-300 mb-2">Close Day</label>
    <select
      value={closeDay}
      onChange={e => setCloseDay(e.target.value)}
      className="w-full rounded-md bg-gray-900 border border-gray-700 text-gray-200 px-4 py-2"
    >
      {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
        <option key={day} value={day}>{day}</option>
      ))}
    </select>
  </div>
  <div>
    <label className="block text-gray-300 mb-2">Close Time</label>
    <input
      type="time"
      value={closeTime}
      onChange={e => setCloseTime(e.target.value)}
      className="w-full rounded-md bg-gray-900 border border-gray-700 text-gray-200 px-4 py-2"
    />
  </div>
</div> 