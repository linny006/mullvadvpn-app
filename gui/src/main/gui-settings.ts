import { app } from 'electron';
import log from 'electron-log';
import * as fs from 'fs';
import * as path from 'path';
import { IGuiSettingsState, SYSTEM_PREFERRED_LOCALE_KEY } from '../shared/gui-settings-state';

const settingsSchema = {
  preferredLocale: 'string',
  autoConnect: 'boolean',
  enableSystemNotifications: 'boolean',
  monochromaticIcon: 'boolean',
  startMinimized: 'boolean',
};

const defaultSettings: IGuiSettingsState = {
  preferredLocale: SYSTEM_PREFERRED_LOCALE_KEY,
  autoConnect: true,
  enableSystemNotifications: true,
  monochromaticIcon: false,
  startMinimized: false,
};

export default class GuiSettings {
  get state(): IGuiSettingsState {
    return this.stateValue;
  }

  set preferredLocale(newValue: string) {
    this.changeStateAndNotify({ ...this.stateValue, preferredLocale: newValue });
  }

  get preferredLocale(): string {
    return this.stateValue.preferredLocale;
  }

  set enableSystemNotifications(newValue: boolean) {
    this.changeStateAndNotify({ ...this.stateValue, enableSystemNotifications: newValue });
  }

  get enableSystemNotifications(): boolean {
    return this.stateValue.enableSystemNotifications;
  }

  set autoConnect(newValue: boolean) {
    this.changeStateAndNotify({ ...this.stateValue, autoConnect: newValue });
  }

  get autoConnect(): boolean {
    return this.stateValue.autoConnect;
  }

  set monochromaticIcon(newValue: boolean) {
    this.changeStateAndNotify({ ...this.stateValue, monochromaticIcon: newValue });
  }

  get monochromaticIcon(): boolean {
    return this.stateValue.monochromaticIcon;
  }

  set startMinimized(newValue: boolean) {
    this.changeStateAndNotify({ ...this.stateValue, startMinimized: newValue });
  }

  get startMinimized(): boolean {
    return this.stateValue.startMinimized;
  }

  public onChange?: (newState: IGuiSettingsState, oldState: IGuiSettingsState) => void;

  private stateValue: IGuiSettingsState = { ...defaultSettings };

  public load() {
    try {
      const settingsFile = this.filePath();
      const contents = fs.readFileSync(settingsFile, 'utf8');
      const rawJson = JSON.parse(contents);

      this.stateValue = {
        ...defaultSettings,
        ...this.validateSettings(rawJson),
      };
    } catch (error) {
      log.error(`Failed to read GUI settings file: ${error}`);
    }
  }

  public store() {
    try {
      const settingsFile = this.filePath();

      fs.writeFileSync(settingsFile, JSON.stringify(this.stateValue));
    } catch (error) {
      log.error(`Failed to write GUI settings file: ${error}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validateSettings(settings: any) {
    Object.entries(settingsSchema).forEach(([key, expectedType]) => {
      const actualType = typeof settings[key];
      if (key in settings && actualType !== expectedType) {
        throw new Error(`Expected ${key} to be of type ${expectedType} but was ${actualType}`);
      }
    });

    return settings as Partial<IGuiSettingsState>;
  }

  private filePath() {
    return path.join(app.getPath('userData'), 'gui_settings.json');
  }

  private changeStateAndNotify(newState: IGuiSettingsState) {
    const oldState = this.stateValue;
    this.stateValue = newState;

    this.store();

    if (this.onChange) {
      this.onChange({ ...newState }, oldState);
    }
  }
}
